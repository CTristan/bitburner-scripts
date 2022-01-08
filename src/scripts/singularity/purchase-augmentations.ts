import { NS } from "@ns"
import { getConstants } from "/scripts/utils.js"

/**
 * Attempts to purchase the most expensive augmentations available
 * from each faction.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable")

    const alwaysAvailableAug = "NeuroFlux Governor"
    const constants = getConstants()
    const factions = constants.Factions
    let ownedAugs = ns.getOwnedAugmentations(true)
    for (let i = 0; i < factions.length; i++) {
        const faction = factions[i]
        const factionAugs = ns.getAugmentationsFromFaction(faction)

        // Build a list of augs for the faction that we don't already own.
        let augs = []
        for (let j = 0; j < factionAugs.length; j++) {
            const augName = factionAugs[j]

            // If we don't already own the aug, let's add it to our list
            if (ownedAugs.indexOf(augName) == -1) {
                const augCost = ns.getAugmentationPrice(augName)
                augs.push({ augName, augCost })
            }
        }

        // Sort the list of augs by cost descending so we can try to purchase
        // the most expensive ones first
        augs = augs.sort((a, b) => b.augCost - a.augCost)

        // If there aren't any new augmentations available from anyone, just
        // try to buy the always available one
        if (augs.length == 0) {
            ns.purchaseAugmentation(faction, alwaysAvailableAug)
        }

        for (let j = 0; j < augs.length; j++) {
            const augName = augs[j].augName

            /**
             * Try to buy the most expensive augmentation available from the
             * faction. If we can, then add it to our list of owned augs and
             * try to buy the next most expensive one. Otherwise, move on to
             * the next faction.
             *
             * This way, we only ever attempt to purchase the most expensive aug
             * from each faction and not just end up buying the cheapest ones
             * which increases the cost multiplier.
             */
            if (ns.purchaseAugmentation(faction, augName)) {
                ownedAugs = ns.getOwnedAugmentations(true)
            } else {
                // Special case where the most expensive augmentation requires a
                // lower tier version
                const rep = ns.getFactionRep(faction)
                const repReq = ns.getAugmentationRepReq(augName)
                const augPrice = ns.getAugmentationPrice(augName)
                const availableMoney = ns.getServerMoneyAvailable("home")

                if (rep >= repReq && availableMoney >= augPrice) {
                    ns.print(`Need to purchase a lower version of  ${augName}`)
                } else {
                    break
                }
            }
        }
    }
}
