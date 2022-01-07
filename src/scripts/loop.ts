import { NS } from "@ns"
import { scanForAllServers } from "/scripts/utils.js"

/**
 * Looping hack/weaken/grow/weaken cycle for either the current server or the best server available.
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const weakenOnly = ns.args[0] == "weaken"
    const growOnly = ns.args[0] == "grow"
    const hackOnly = ns.args[0] == "hack"
    disableLogs(ns)

    if (weakenOnly) {
        while (true) {
            await weakenServers(ns)
        }
    } else if (growOnly) {
        while (true) {
            await growServers(ns)
        }
    } else if (hackOnly) {
        while (true) {
            await hackServers(ns)
        }
    } else {
        // We want to space out the loops so they don't all attack the same server at the exact same time
        const waitTime = parseInt(ns.args[0].toString()) * 1000
        await ns.sleep(waitTime)

        while (true) {
            // No args, so we'll loop HWGW.
            const server = await findBestServer(ns)
            const minSecurityLevel = ns.getServerMinSecurityLevel(server)
            const maxMoney = ns.getServerMaxMoney(server)

            // Because multiple scripts might attack the same server, we'll have sanity checks at each step.
            let moneyAvailable = ns.getServerMoneyAvailable(server)
            if (moneyAvailable > 0) {
                await ns.hack(server)
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
        }
    }
}

/**
 * Finds the best server to use if the current one has no money.
 * @param {NS} ns
 * @return The best hackable server found.
 */
async function findBestServer(ns: NS): Promise<string> {
    // Get all of the reachable servers
    ns.print("About to scan for all servers.")
    const servers = scanForAllServers(ns)
    const bestServer = {
        serverName: "",
        moneyPerSecond: 0,
    }

    for (let i = 0; i < servers.length; i++) {
        const server = servers[i]
        // Make sure we can actually hack it
        if (ns.hasRootAccess(server)) {
            // Get the money/second for hacking the server
            const serverMoney = ns.getServerMoneyAvailable(server)
            const timeToHack = ns.getHackTime(server)
            const moneyPerSecond = serverMoney / timeToHack
            if (moneyPerSecond > bestServer.moneyPerSecond) {
                ns.print(
                    "New best server: " +
                        server +
                        " with $" +
                        moneyPerSecond +
                        " dps."
                )
                bestServer.serverName = server
                bestServer.moneyPerSecond = moneyPerSecond
            }
        }
    }

    return bestServer.serverName
}

/**
 * Finds the server with the largest gap between minimum security level and current security level,
 * then weakens them.
 * @param {NS} ns
 */
async function weakenServers(ns: NS): Promise<void> {
    // Get all of the reachable servers
    ns.print("About to scan for all servers.")
    const servers = scanForAllServers(ns)
    const strongestServer = {
        serverName: "",
        securityLevel: 0,
    }

    // Start at 1 to skip the first server, which is always home
    for (let i = 1; i < servers.length; i++) {
        const server = servers[i]

        // Make sure we can actually hack it
        if (ns.hasRootAccess(server)) {
            // Subtract the min security level to get the widest gap, since we don't want to weaken a server
            // that is at or close to its minimum security level.
            const securityLevel =
                ns.getServerSecurityLevel(server) -
                ns.getServerMinSecurityLevel(server)
            if (securityLevel > strongestServer.securityLevel) {
                ns.print(
                    "New strongest server: " +
                        server +
                        " with a security difference of " +
                        securityLevel +
                        "."
                )
                strongestServer.serverName = server
                strongestServer.securityLevel = securityLevel
            }
        }
    }

    // Weaken the strongest server
    if (strongestServer.serverName != "") {
        const server = strongestServer.serverName
        await ns.weaken(server)
    } else {
        // Protection against infinite loop
        await ns.sleep(1000)
    }
}

/**
 * Finds the server with the largest gap between available money and maximum money, then grows it.
 * @param {NS} ns
 */
async function growServers(ns: NS): Promise<void> {
    // Get all of the reachable servers
    ns.print("About to scan for all servers.")
    const servers = scanForAllServers(ns)
    const cheapestServer = {
        serverName: "",
        serverMoney: 0,
    }

    // Start at 1 to skip the first server, which is always home
    for (let i = 1; i < servers.length; i++) {
        const server = servers[i]
        // Make sure we can actually hack it
        if (ns.hasRootAccess(server)) {
            // Subtract the available money from the maximum amount of money to get the widest gap, since we
            // don't want to grow a server that is at or close to its maximum funds.
            const serverMoney =
                ns.getServerMaxMoney(server) -
                ns.getServerMoneyAvailable(server)
            if (serverMoney > cheapestServer.serverMoney) {
                ns.print(
                    "New cheapest server: " +
                        server +
                        " with a difference of $" +
                        serverMoney +
                        "."
                )
                cheapestServer.serverName = server
                cheapestServer.serverMoney = serverMoney
            }
        }
    }

    // Grow the cheapest server
    if (cheapestServer.serverName != "") {
        const server = cheapestServer.serverName
        await ns.grow(server)
    } else {
        // Protection against infinite loop
        await ns.sleep(1000)
    }
}

async function hackServers(ns: NS): Promise<number> {
    const server = await findBestServer(ns)
    return ns.hack(server)
}

function disableLogs(ns: NS): void {
    ns.disableLog("getServerMaxMoney")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("scan")
}
