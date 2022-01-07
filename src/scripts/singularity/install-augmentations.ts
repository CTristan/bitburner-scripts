import { NS } from "@ns"
import { getConstants, forceRunScript } from "/scripts/utils.js"

/**
 * Runs checks to validate whether we should install augmentations now and restart.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const doInstall = false
    const constants = getConstants()

    // Check if installing would push a faction's favor past the donation threshold
    const factions = constants.Factions
    for (let i = 0; i < factions.length; i++) {
        const faction = factions[i]
        const currentFavor = ns.getFactionFavor(faction)

        if (currentFavor < 150) {
            const favorGain = ns.getFactionFavorGain(faction)

            if (currentFavor + favorGain >= 150) {
                installAugmentations(ns)
            }
        }
    }

    if (doInstall) installAugmentations(ns)
}

/**
 * @param {NS} ns
 */
export function installAugmentations(ns: NS): void {
    // Before installing augmentations, try to make any last-minute purchases
    forceRunScript(ns, "/scripts/purchase-any-augmentations.js")

    ns.installAugmentations("first-run.js")
}
