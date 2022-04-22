import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { isFocused, isWorking } from "/scripts/utils.js"

const Factions = Constants.Factions
const workType = Constants.WorkTypes.Factions

interface IFactionToWork {
    [key: string]: string | number
    name: string
    favor: number
    repReq: number
}

/**
 * Work for a faction that we don't yet have enough rep with for all
 * of their augmentations.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    let factions = getFactions(ns)

    // Sort by least favor so we can improve our most needed factions first
    // But sort by lowest reputation requirement first in the case of ties
    factions = factions.sort((a, b) => a.repReq - b.repReq)
    factions = factions.sort((a, b) => a.favor - b.favor)

    const factionToWorkFor = { name: "", repReq: 0 }
    for (const faction of factions) {
        // If we don't have any faction rep, that means we aren't a member yet
        if (
            ns.singularity.getFactionRep(faction.name) > 0 &&
            ns.singularity.getFactionRep(faction.name) < faction.repReq
        ) {
            factionToWorkFor.name = faction.name
            factionToWorkFor.repReq = faction.repReq
            break
        }
    }

    if (factionToWorkFor.name != "") {
        await workForFaction(ns, factionToWorkFor.name, factionToWorkFor.repReq)
        return
    }

    // If we're still working for a faction when we don't need to, let's stop
    // so we can do other actions.
    if (ns.getPlayer().workType === workType) {
        ns.singularity.stopAction()
    }
}

function getFactions(ns: NS): IFactionToWork[] {
    const ownedAugs = ns.singularity.getOwnedAugmentations(true)
    const factions = []

    for (const key in Factions) {
        const faction = Factions[key]

        /**
         * We want to get the required rep based off of the augmentations
         * that we don't own already
         */
        const augs = ns.singularity.getAugmentationsFromFaction(faction.name).filter((aug) => !ownedAugs.includes(aug))

        let highestRepReq = 0
        for (const aug of augs) {
            const repReq = ns.singularity.getAugmentationRepReq(aug)
            highestRepReq = Math.max(highestRepReq, repReq)
        }

        /**
         * To prevent an issue where we get stuck on a high-rep faction because
         * we used the +1 favor bonus very early in a bitnode, we'll also
         * include how much favor we've gained so far in our sorting.
         */
        const favor =
            ns.singularity.getFactionFavor(faction.name) +
            ns.singularity.getFactionFavorGain(faction.name)

        factions.push({
            favor: favor,
            name: faction.name,
            repReq: highestRepReq,
        })
    }

    return factions
}

/**
 * Work for a faction. Priority is FieldWork -> SecurityWork -> Hacking.
 * This is so that non-Hacking stats can be leveled for infiltration.
 *
 * @param {NS} ns
 */
async function workForFaction(
    ns: NS,
    faction: string,
    repReq: number
): Promise<void> {
    let rep = ns.singularity.getFactionRep(faction)

    // First try donating money to increase rep the fastest
    rep = donateToFaction(ns, faction, repReq)

    if (rep < repReq) {
        const focus = isFocused(ns, workType)

        if (
            !ns.singularity.workForFaction(faction, "Hacking", focus) &&
            !ns.singularity.workForFaction(faction, "Field Work", focus)
        ) {
            ns.singularity.workForFaction(faction, "Security Work", focus)
        }

        /**
         * Sleep until we do any of the following:
         * - Gain the rest of the rep needed
         * - Gain 1 favor (500 rep)
         * - Start working on something else
         */
        const repDifference = repReq - rep
        const repForOneFavor = 500
        const repToGain = Math.min(repDifference, repForOneFavor)
        while (
            ns.getPlayer().workRepGained < repToGain &&
            isWorking(ns, workType)
        ) {
            ns.print(`Working until we've gained ${repToGain} rep.`)
            await ns.sleep(1000)
        }
    }
}

/**
 * @param {NS} ns
 */
function donateToFaction(ns: NS, faction: string, repReq: number): number {
    const favor = ns.singularity.getFactionFavor(faction)
    let rep = ns.singularity.getFactionRep(faction)

    if (favor >= 150) {
        const repDifference = repReq - rep
        const repMultiplier = favor / 100

        /**
         * Formula for reputation gain:
         * reputation = donationAmount * reputationMultiplier / 10e6
         *
         * Formula for donation amount:
         * donationAmount = reputation * 10e6 / reputationMultiplier
         */
        const donationAmount = Math.ceil((repDifference * 10e6) / repMultiplier)
        ns.singularity.donateToFaction(faction, donationAmount)

        rep = ns.singularity.getFactionRep(faction)
    }

    return rep
}
