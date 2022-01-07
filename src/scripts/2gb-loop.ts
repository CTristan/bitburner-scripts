import { NS } from "@ns"

/**
 * A (very) small loop for 2GB servers.
 *  @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable")

    // Too expensive to analyze servers, so we'll just hack a server that's always available.
    const hostname = "foodnstuff"

    while (true) {
        await ns.hack(hostname)
        await ns.weaken(hostname)
        await ns.grow(hostname)
        await ns.weaken(hostname)
    }
}
