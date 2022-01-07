import { NS } from "@ns"
import {
    connectTo,
    isServerOwned,
    restartWithMaxThreadsIfPossible,
    runScript,
    scanForAllServers,
} from "/scripts/utils.js"

/**
 * Continually finds the server with the most money to hack.
 * @param {NS} ns
 * **/
export async function main(ns: NS): Promise<void> {
    // Check if we're indicating a first run
    if (ns.args[0] == true) {
        runScript(ns, "/scripts/automate-purchases.js", "home", true)
        ns.spawn("/scripts/hack-the-planet.js")
    }
    disableLogs(ns)

    // Start home scripts for first run
    const hostName = ns.getHostname()
    if (hostName == "home") {
        runScript(ns, "/scripts/worm.js")
        runScript(ns, "/scripts/automate-purchases.js")
        runScript(ns, "/scripts/start-singularity.js", "home", true)
        runScript(ns, "watcher.js")
    }

    // Make sure we're using the most threads available
    restartWithMaxThreadsIfPossible(ns)

    while (true) {
        // Root any servers we can hack
        runScript(ns, "/scripts/worm.js")

        // Get all of the reachable servers
        ns.print("About to scan for all servers.")
        const servers = scanForAllServers(ns, true)
        const bestServer = {
            serverName: "",
            dollarsPerSecond: 0,
        }

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i]

            // Make sure we can actually hack it and we don't own it
            if (ns.hasRootAccess(server) && !isServerOwned(server)) {
                const moneyAvailable = ns.getServerMoneyAvailable(server)
                const hackTime = ns.getHackTime(server)
                const dollarsPerSecond = moneyAvailable / hackTime
                if (dollarsPerSecond > bestServer.dollarsPerSecond) {
                    ns.print(
                        "New best server: " +
                            server +
                            " with $" +
                            dollarsPerSecond +
                            " dps."
                    )
                    bestServer.serverName = server
                    bestServer.dollarsPerSecond = dollarsPerSecond
                }
            }
        }

        // Hack the best server, and if it fails weaken and try again
        if (bestServer.serverName != "") {
            const server = bestServer.serverName

            // Manually connect to and hack the server for additional benefits.
            connectTo(ns, server)
            const minSecurityLevel = ns.getServerMinSecurityLevel(server)
            const maxMoney = ns.getServerMaxMoney(server)

            // HWGW is the most profitable cycle.
            // Because multiple scripts might attack the same server, we'll have sanity checks at each step.
            let moneyAvailable = ns.getServerMoneyAvailable(server)
            if (moneyAvailable > 0) {
                await ns.manualHack()
            }

            let securityLevel = ns.getServerSecurityLevel(server)
            if (securityLevel > minSecurityLevel) {
                await ns.weaken(server)
            }

            moneyAvailable = ns.getServerMoneyAvailable(server)
            if (moneyAvailable < maxMoney) {
                await ns.grow(server)
            }

            securityLevel = ns.getServerSecurityLevel(server)
            if (securityLevel > minSecurityLevel) {
                await ns.weaken(server)
            }
        } else {
            // Protection against infinite loop if worm.ns hasn't finished working during the first run.
            await ns.sleep(1000)
        }
    }
}

function disableLogs(ns: NS): void {
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("scan")
}
