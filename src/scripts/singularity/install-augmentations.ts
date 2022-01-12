import { NS } from "@ns";
import * as Constants from "/classes/constants.js";
import { forceRunScript } from "/scripts/utils.js";

const Factions = Constants.Factions;

/**
 * Runs checks to validate whether we should install augmentations
 * now and restart.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    await checkFactionFavor(ns);
    await checkPurchasedFactionAugs(ns);
}

/**
 * Checks if installing would push a faction's favor past
 * the donation threshold.
 *
 * @param {NS} ns
 */
async function checkFactionFavor(ns: NS): Promise<void> {
    for (const key in Factions) {
        const faction = Factions[key];
        const currentFavor = ns.getFactionFavor(faction.name);

        if (currentFavor < 150) {
            const favorGain = ns.getFactionFavorGain(faction.name);

            if (currentFavor + favorGain >= 150) {
                await installAugmentations(ns);
            }
        }
    }
}

/**
 * Checks if we have purchased every augmentation a faction sells but don't have
 * them installed yet.
 *
 * @param ns
 */
async function checkPurchasedFactionAugs(ns: NS): Promise<void> {
    const ownedAugs = ns.getOwnedAugmentations(true);
    const installedAugs = ns.getOwnedAugmentations();
    const purchasedAugs = ownedAugs.filter(
        (aug) => !installedAugs.includes(aug)
    );

    for (const key in Factions) {
        const faction = Factions[key];
        const factionAugs = ns.getAugmentationsFromFaction(faction.name);
        const remainingFactionAugs = factionAugs.filter(
            (aug) => !ownedAugs.includes(aug)
        );

        /**
         * Check if there are no more remaining augmentations and there is at
         * least one purchased aug from the faction. The assumption is that in this
         * situation we just finished installing all of the faction's augmentations.
         */
        if (remainingFactionAugs.length === 0) {
            for (const purchasedAug of purchasedAugs) {
                if (factionAugs.includes(purchasedAug)) {
                    // If we have a purchased augmentation from the faction and they have
                    // no more remaining then we want to install them
                    await installAugmentations(ns);
                }
            }
        }
    }
}

/**
 * @param {NS} ns
 */
async function installAugmentations(ns: NS): Promise<void> {
    // Before installing augmentations, try to make any last-minute purchases
    await forceRunScript(ns, "/scripts/purchase-any-augmentations.js");

    ns.installAugmentations("first-run.js");
}
