import { NS } from "@ns"
import { getConstants, isWorking } from "/scripts/utils.js"

const workType = getConstants().WorkTypes.Factions

/**
 * Work for a faction that we don't yet have enough rep with for all
 * of their augmentations.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const constants = getConstants()
    const factions = constants.Factions
    const ownedAugs = ns.getOwnedAugmentations(true)

    for (let i = 0; i < factions.length; i++) {
        const faction = factions[i]

        // If we don't have any faction rep, that means we aren't a member yet
        if (ns.getFactionRep(faction) > 0) {
            // Only consider augmentations we don't own already
            const augs = ns
                .getAugmentationsFromFaction(faction)
                .filter((aug) => ownedAugs.indexOf(aug) == -1)
            let highestRepReq = 0

            for (let j = 0; j < augs.length; j++) {
                const repReq = ns.getAugmentationRepReq(augs[j])
                highestRepReq = Math.max(highestRepReq, repReq)
            }

            // If we meet the criteria, let's work for this faction
            if (ns.getFactionRep(faction) < highestRepReq) {
                await workForFaction(ns, faction, highestRepReq)

                // Keep working until we've either hit our desired rep or
                // started other work.
                while (
                    ns.getFactionRep(faction) < highestRepReq &&
                    isWorking(ns, workType)
                ) {
                    await workForFaction(ns, faction, highestRepReq)
                }

                // We're done working for this faction now
                if (isWorking(ns, workType)) {
                    ns.stopAction()
                }
                return
            }
        }
    }

    // If we're still working on a faction, we can stop now
    if (isWorking(ns, workType)) {
        ns.stopAction()
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
        const focus = ns.isFocused()

        if (
            !ns.workForFaction(faction, "Field Work", focus) &&
            !ns.workForFaction(faction, "Security Work", focus)
        ) {
            ns.workForFaction(faction, "Hacking", focus)
        }

        // Sleep until we gain 1000 rep or start working on something else
        while (ns.getPlayer().workRepGained < 1000 && isWorking(ns, workType)) {
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
