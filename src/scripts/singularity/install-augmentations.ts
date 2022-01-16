import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { forceRunScript } from "/scripts/utils.js"

const Factions = Constants.Factions

/**
 * Runs checks to validate whether we should install augmentations
 * now and restart.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    if (
        purchasedGenericAugmentation(ns) ||
        checkFactionFavor(ns) ||
        checkPurchasedFactionAugs(ns)
    ) {
        await installAugmentations(ns)
    }
}

/**
 * If we've purchased the generic augmentation, that means that we've been
 * playing for a long-enough time that a faction we've already completed got
 * enough passive rep to buy another augmentation. The assumption in that case
 * is that either we've finished all of the factions or the faction we are
 * currently working on requires so much rep that we're much better off taking
 * the 1% increase and favor gain over continuing to work.
 *
 * @param ns
 */
function purchasedGenericAugmentation(ns: NS): boolean {
    return getPurchasedAugs(ns).includes(Constants.AlwaysAvailableAugmentation)
}
/**
 * Checks if installing would push a faction's favor past
 * the donation threshold.
 *
 * @param {NS} ns
 */
function checkFactionFavor(ns: NS): boolean {
    for (const key in Factions) {
        const faction = Factions[key]
        const currentFavor = ns.getFactionFavor(faction.name)

        if (currentFavor < 150) {
            const favorGain = ns.getFactionFavorGain(faction.name)

            if (currentFavor + favorGain >= 150) {
                return true
            }
        }
    }

    return false
}

/**
 * Checks if we have purchased every augmentation a faction sells but don't have
 * them installed yet.
 *
 * @param ns
 */
function checkPurchasedFactionAugs(ns: NS): boolean {
    const ownedAugs = ns.getOwnedAugmentations(true)
    const purchasedAugs = getPurchasedAugs(ns)

    for (const key in Factions) {
        const faction = Factions[key]
        const factionAugs = ns.getAugmentationsFromFaction(faction.name)
        const remainingFactionAugs = factionAugs.filter(
            (aug) => !ownedAugs.includes(aug)
        )

        /**
         * Check if there are no more remaining augmentations and there is at
         * least one purchased aug from the faction. The assumption is that in this
         * situation we just finished installing all of the faction's augmentations.
         */
        if (remainingFactionAugs.length === 0) {
            for (const purchasedAug of purchasedAugs) {
                if (factionAugs.includes(purchasedAug)) {
                    /**
                     * If we have a purchased augmentation from the faction and they have
                     * no more remaining then we want to install them
                     */
                    return true
                }
            }
        }
    }

    return false
}

/**
 * Gets the augmentations the player has purchased so far. Will include every
 * level of the generic augmentation purchased since the last installation.
 *
 * @param ns
 * @returns
 */
function getPurchasedAugs(ns: NS): string[] {
    const ownedAugs = ns.getOwnedAugmentations(true)
    const installedAugs = ns.getOwnedAugmentations()

    // Purchased augmentations are ones that we have owned but aren't yet
    // installed.
    const purchasedAugs = ownedAugs.filter(
        (aug) => !installedAugs.includes(aug)
    )

    // If we bought the generic then ownedAugs will have multiple entries with
    // the same name - one for each level purchased plus the initial level
    let count = 0
    ownedAugs.forEach((aug) => {
        if (aug === Constants.AlwaysAvailableAugmentation) {
            /**
             * Increment count first
             * then if we're past our first one
             * then we'll add it to the purchased augmentations
             */
            count++
            if (count > 1) {
                purchasedAugs.push(aug)
            }
        }
    })

    return purchasedAugs
}

/**
 * @param {NS} ns
 */
async function installAugmentations(ns: NS): Promise<void> {
    // Before installing augmentations, try to make any last-minute purchases
    await forceRunScript(ns, "/scripts/purchase-any-augmentations.js")

    ns.installAugmentations("first-run.js")
}
