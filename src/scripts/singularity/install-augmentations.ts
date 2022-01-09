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
    const doInstall = false

    // Check if installing would push a faction's favor past
    // the donation threshold
    for (const key in Factions) {
        const faction = Factions[key]
        const currentFavor = ns.getFactionFavor(faction)

        if (currentFavor < 150) {
            const favorGain = ns.getFactionFavorGain(faction)

            if (currentFavor + favorGain >= 150) {
                await installAugmentations(ns)
            }
        }
    }

    if (doInstall) {
        await installAugmentations(ns)
    }
}

/**
 * @param {NS} ns
 */
export async function installAugmentations(ns: NS): Promise<void> {
    // Before installing augmentations, try to make any last-minute purchases
    await forceRunScript(ns, "/scripts/purchase-any-augmentations.js")

    ns.installAugmentations("first-run.js")
}
