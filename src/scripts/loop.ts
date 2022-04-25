import { NS } from "@ns"
import { scanForAllServers } from "/scripts/utils.js"

/**
 * Preps the server, runs hack/grow/weaken scripts, then either loops hacking
 * or continuously finds the best server for the HGW scripts to attack.
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    disableLogs(ns)

    // Start with the current server
    const host = ns.getHostname();
    await ns.write("host.txt", host, "w");

    // Start up all of the scripts
    startScripts(ns, host);

    // From now on we either hack or find the best server depending on if this server has any money.
    if (ns.getServerMaxMoney(host) > 0) {
        for (; ;) {
            await ns.hack(host);
            await ns.grow(host);
            await ns.weaken(host);
        }
    } else {
        for (; ;) {
            const oldServerToHack = await ns.read("host.txt");
            const serverToHack = await findBestServer(ns);
            if (serverToHack !== oldServerToHack) {
                await ns.write("host.txt", serverToHack, "w");
            }

            // Weaken always takes the longest, so this will let all of the
            // scripts run for at least one cycle
            await ns.weaken(serverToHack);
        }
    }
}

/**
 * Start the hack/grow/weaken scripts to fill up the server.
 * Uses a ratio of 1 weaken : 1 hack : 12 grow.
 * It takes 1 weaken command to counteract 12.5 grow commands,
 * so a weaken will handle 12 grows and 1 hack.
 * 
 * TODO: Monitor and re-evaluate to see if this holds true on every server.
 */
function startScripts(ns: NS, host: string) {
    // Make sure we don't clog up the server with hundreds of processes
    const maxProcesses = 99
    const scriptsRam = ns.getScriptRam("/scripts/hack/weaken.js");
    let serverMaxRam = ns.getServerMaxRam(host);

    // If we're on home, then we'll set our max ram to only use our available RAM 
    // and save 20% of that for new processes.
    if (host === "home") {
        serverMaxRam = (serverMaxRam - ns.getServerUsedRam(host)) * 0.8;
    }

    let threads = Math.max(
        Math.ceil(serverMaxRam / scriptsRam / maxProcesses),
        1
    )

    let serverUsedRam = ns.getServerUsedRam(host)
    let serverRam = serverMaxRam - serverUsedRam

    let scriptNumber = 0;
    while (serverRam > scriptsRam) {
        const scriptToRun = getScriptToRun(ns, scriptNumber);
        /**
         * Need to check for failed exec due to out of RAM to prevent infinite
         * loop. Usually happens on the last instance where there's still
         * available RAM but not enough for the full number of threads.
         */
        let processId = ns.run(scriptToRun, threads, scriptNumber)
        while (processId === 0) {
            threads--

            if (threads <= 0) {
                return
            }

            processId = ns.run(scriptToRun, threads, scriptNumber)
        }

        scriptNumber++
        serverUsedRam = ns.getServerUsedRam(host)
        serverRam = serverMaxRam - serverUsedRam
    }
}

function getScriptToRun(ns: NS, scriptNumber: number): string {
    const hackScript = "/scripts/hack/hack.js";
    const growScript = "/scripts/hack/grow.js";
    const weakenScript = "/scripts/hack/weaken.js";

    // Uses a ratio of 1 weaken : 1 hack : 12 grow.
    const totalScripts = 14;
    switch (scriptNumber % totalScripts) {
        // First script is always grow since main script becomes a hack script
        case 0:
            return growScript;
        // Second script is always weaken
        case 1:
            return weakenScript;
        // Third script is always hack
        case 2:
            return hackScript;
        // Last 11 scripts are grow
        default:
            return growScript;
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
        moneyPerSecond: 0,
        name: "",
    }

    while (bestServer.name === "") {
        for (const server of servers) {
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
                    bestServer.name = server
                    bestServer.moneyPerSecond = moneyPerSecond
                }
            }
        }

        // Most likely reason we don't have a best server yet is that the worm
        // either hasn't finished or needs to run.
        if (bestServer.name === "") {
            ns.print("Not able to find any hackable servers, retrying.")
            await ns.sleep(1000)
        }
    }

    return bestServer.name
}

function disableLogs(ns: NS): void {
    ns.disableLog("getServerMaxMoney")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("scan")
}
