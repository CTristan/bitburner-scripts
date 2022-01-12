import { NS } from "@ns";
import { connectTo } from "/scripts/utils.js";

/**
 * Installs a backdoor on the currently-connected server.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const hostname = ns.args[0].toString(),
        server = ns.getServer(hostname);

    if (!server.backdoorInstalled) {
        connectTo(ns, hostname);
        await ns.installBackdoor();
    }

    // Has to run after the backdoor is installed, otherwise some files may
    // still be hidden.
    const lore = ns.ls(hostname, ".lit");

    // Now that we have a backdoor installed, we can see all of the files
    if (lore.length > 0) {
        await ns.scp(lore, hostname, "home");
    }
}
