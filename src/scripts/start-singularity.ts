import { NS } from "@ns"
import { forceRunScript } from "/scripts/utils.js"

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    // First parameter is whether or not we want to buy programs instead
    // of creating them.
    const buyPrograms = ns.args[0]

    while (true) {
        // Make sure we're always using the most RAM available
        if (ns.upgradeHomeRam()) {
            ns.kill("hack-the-planet.js", "home")
            ns.exec("hack-the-planet.js", "home")
        }
        await forceRunScript(ns, "/scripts/singularity/upgrade-home-cores.js")

        // Check for upgrades/invites
        if (buyPrograms) {
            await forceRunScript(ns, "/scripts/singularity/buy-programs.js")
        }

        await forceRunScript(ns, "/scripts/singularity/join-factions.js")
        await forceRunScript(
            ns,
            "/scripts/singularity/purchase-augmentations.js"
        )

        // Perform work.
        await forceRunScript(ns, "/scripts/singularity/perform-work.js")

        // If we're ready for it, let's install our augmentations
        await forceRunScript(
            ns,
            "/scripts/singularity/install-augmentations.js"
        )

        await ns.sleep(1000)
    }
}