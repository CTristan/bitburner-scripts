import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { isWorking } from "/scripts/utils.js"

const Factions = Constants.Factions
const workType = Constants.WorkTypes.Factions

/**
 * Work for a faction that we don't yet have enough rep with for all
 * of their augmentations.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const ownedAugs = ns.getOwnedAugmentations(true)

    let factions = []
    for (const key in Factions) {
        const faction = Factions[key]

        /**
         * We want to get the required rep based off of the augmentations
         * that we don't own already
         */
        const augs = ns
            .getAugmentationsFromFaction(faction.name)
            .filter((aug) => !ownedAugs.includes(aug))

        let highestRepReq = 0
        for (const aug of augs) {
            const repReq = ns.getAugmentationRepReq(aug)
            highestRepReq = Math.max(highestRepReq, repReq)
        }

        factions.push({
            favor: ns.getFactionFavor(faction.name),
            name: faction.name,
            repReq: highestRepReq,
        })
    }

    // Sort by least favor so we can improve our most needed factions first
    // But sort by lowest reputation requirement first in the case of ties
    factions = factions.sort((a, b) => a.repReq - b.repReq)
    factions = factions.sort((a, b) => a.favor - b.favor)

    const factionToWorkFor = { name: "", repReq: 0 }
    for (const faction of factions) {
        // If we don't have any faction rep, that means we aren't a member yet
        if (
            ns.getFactionRep(faction.name) > 0 &&
            ns.getFactionRep(faction.name) < faction.repReq
        ) {
            factionToWorkFor.name = faction.name
            factionToWorkFor.repReq = faction.repReq
            break
        }
    }

    if (factionToWorkFor.name != "") {
        await workForFaction(ns, factionToWorkFor.name, factionToWorkFor.repReq)
    }
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
    let rep = ns.getFactionRep(faction)

    // First try donating money to increase rep the fastest
    rep = donateToFaction(ns, faction, repReq)

    if (rep < repReq) {
        if (
            !ns.workForFaction(faction, "Hacking") &&
            !ns.workForFaction(faction, "Field Work")
        ) {
            ns.workForFaction(faction, "Security Work")
        }

        // Sleep until we gain 1000 rep or start working on something else
        while (ns.getPlayer().workRepGained < 1000 && isWorking(ns, workType)) {
            // eslint-disable-next-line no-await-in-loop
            await ns.sleep(1000)
        }
    }
}

/**
 * @param {NS} ns
 */
function donateToFaction(ns: NS, faction: string, repReq: number): number {
    const favor = ns.getFactionFavor(faction)
    let rep = ns.getFactionRep(faction)

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
        ns.donateToFaction(faction, donationAmount)

        rep = ns.getFactionRep(faction)
    }

    return rep
}
