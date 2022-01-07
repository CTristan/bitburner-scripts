import { NS } from "@ns"
import { getConstants } from "/scripts/utils.js"

/**
 * Works for a faction that we don't yet have enough rep with for all of their augmentations.
 * Only activates if we're not busy with something else.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const constants = getConstants()
    const WorkTypes = constants.WorkTypes
    const factions = constants.Factions
    let player = ns.getPlayer()
    const ownedAugs = ns.getOwnedAugmentations(true)
    const alwaysAvailableAug = "NeuroFlux Governor"

    for (let i = 0; i < factions.length; i++) {
        const faction = factions[i]

        // If we don't have any faction rep, that means we aren't a member yet
        if (ns.getFactionRep(faction) > 0) {
            // Only consider augmentations we don't own already
            const augs = ns
                .getAugmentationsFromFaction(faction)
                .filter(
                    (aug) =>
                        ownedAugs.indexOf(aug) == -1 ||
                        aug.startsWith(alwaysAvailableAug)
                )
            let highestRepReq = 0

            for (let j = 0; j < augs.length; j++) {
                const repReq = ns.getAugmentationRepReq(augs[j])
                highestRepReq = Math.max(highestRepReq, repReq)
            }

            let rep = ns.getFactionRep(faction)

            // First try donating money to increase rep the fastest
            if (rep < highestRepReq) {
                rep = donateToFaction(ns, faction, highestRepReq)
            }

            if (rep < highestRepReq) {
                workForFaction(ns, faction)

                // Need work for at least a minute before checking rep again. Rep is only updated after
                // the work is stopped, so we need to restart it for the next go-around.
                await ns.sleep(60000)
                player = ns.getPlayer()
                if (player.workType === WorkTypes.Factions) {
                    workForFaction(ns, faction)
                }

                return
            }
        }
    }
}

/**
 * Work for a faction. Priority is FieldWork -> SecurityWork -> Hacking.
 * This is so that non-Hacking stats can be leveled for infiltration.
 *
 * @param {NS} ns
 */
function workForFaction(ns: NS, faction: string): void {
    const focus = ns.isFocused()
    if (
        !ns.workForFaction(faction, "Field Work", focus) &&
        !ns.workForFaction(faction, "Security Work", focus)
    ) {
        ns.workForFaction(faction, "Hacking", focus)
    }
}

/**
 * @param {NS} ns
 */
function donateToFaction(ns: NS, faction: string, repReq: number): number {
    let rep = ns.getFactionRep(faction)
    const favor = ns.getFactionFavor(faction)

    if (favor >= 150) {
        const repDifference = repReq - rep
        const repMultiplier = favor / 100

        // Formula for reputation gain: reputation = donationAmount * reputationMultiplier / 10e6
        // Formula for donation amount: donationAmount = reputation * 10e6 / reputationMultiplier
        const donationAmount = Math.ceil((repDifference * 10e6) / repMultiplier)
        ns.donateToFaction(faction, donationAmount)

        rep = ns.getFactionRep(faction)
    }

    return rep
}
