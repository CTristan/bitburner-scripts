import { NS } from "@ns";
import { forceRunScript } from "/scripts/utils.js";

/**
 * Upgrades the amount of RAM on the home server.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    // Make sure we're always using the most RAM available
    if (ns.upgradeHomeRam()) {
        ns.kill("hack-the-planet.js", "home");
        ns.exec("hack-the-planet.js", "home");
        await forceRunScript(ns, "/scripts/worm.js", "home", true);
    }
}
