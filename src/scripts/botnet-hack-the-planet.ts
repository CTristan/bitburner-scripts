import { NS } from "@ns";
import * as Constants from "/classes/constants.js";
import {
    forceRunScript,
    isServerOwned,
    runScript,
    scanForAllServers,
} from "/scripts/utils.js";

const Tasks = Constants.Tasks;

/**
 * Continually finds the server with the most money to hack, preps it for
 * batching, then updates the botnet.
 *
 * @param {NS} ns
 * **/
export async function main(ns: NS): Promise<void> {
    // Check if we're indicating a first run
    if (ns.args[0] == true) {
        runScript(ns, "/scripts/automate-purchases.js", "home", true);
        ns.spawn("/scripts/hack-the-planet.js");
    }
    disableLogs(ns);

    // Start home scripts for first run
    const hostName = ns.getHostname();
    if (hostName == "home") {
        runScript(ns, "/scripts/worm.js");
        runScript(ns, "/scripts/automate-purchases.js");
        runScript(ns, "/scripts/start-singularity.js", "home", true);
        runScript(ns, "watcher.js");
    }

    let hostname = "";

    // Since this is an infinite loop, we want to run sequentially
    /* eslint-disable no-await-in-loop */
    for (;;) {
        // Root any servers we can hack
        runScript(ns, "/scripts/worm.js");

        // Check if we're still on the best server
        const bestServer = getServerWithMostMoney(ns);

        if (hostname != bestServer) {
            hostname = bestServer;

            // Calibrate the botnet
            await updateBotnetTarget(ns, hostname);
            await weakenServer(ns, hostname);
            await growServer(ns, hostName);
            await weakenServer(ns, hostName);
            await updateBotnetTimers(ns, hostname);
        } else {
            await ns.sleep(1000);
        }
    }
    /* eslint-enable no-await-in-loop */
}

function getServerWithMostMoney(ns: NS): string {
    // Get all of the reachable servers
    const servers = scanForAllServers(ns, true);
    const bestServer = {
        money: 0,
        name: "",
    };

    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];

        // Make sure we can actually hack it and we don't own it
        const maxMoney = ns.getServerMaxMoney(server);
        if (
            ns.hasRootAccess(server) &&
            !isServerOwned(server) &&
            maxMoney > bestServer.money
        ) {
            bestServer.name = server;
            bestServer.money = maxMoney;
        }
    }

    return bestServer.name;
}

async function growServer(ns: NS, hostname: string): Promise<void> {
    await updateBotnetTask(ns, Tasks.Grow);
    while (!isServerAtMaxMoney(ns, hostname)) {
        // eslint-disable-next-line no-await-in-loop
        await ns.grow(hostname);
    }
}

function isServerAtMaxMoney(ns: NS, hostname: string): boolean {
    return (
        ns.getServerMoneyAvailable(hostname) === ns.getServerMaxMoney(hostname)
    );
}

function isServerAtMinSecurity(ns: NS, hostname: string): boolean {
    return (
        ns.getServerSecurityLevel(hostname) ===
        ns.getServerMinSecurityLevel(hostname)
    );
}

async function restartBotnet(ns: NS): Promise<void> {
    await forceRunScript(ns, "/scripts/worm.js", "home", true);
}

async function updateBotnetTarget(ns: NS, target: string): Promise<void> {
    await ns.write("/botnet/target.txt", target, "w");
    await restartBotnet(ns);
}

async function updateBotnetTask(ns: NS, task: string): Promise<void> {
    await ns.write("/botnet/task.txt", task, "w");
    await restartBotnet(ns);
}

/**
 * Updates the botnet timers using the server's time to hack/grow/weaken.
 *
 * @param ns
 */
async function updateBotnetTimers(ns: NS, hostname: string): Promise<void> {
    const hackTime = ns.getHackTime(hostname);
    const growTime = ns.getGrowTime(hostname);
    const weakenTime = ns.getWeakenTime(hostname);
    const timerString = `${hackTime},${growTime},${weakenTime}`;
    await ns.write("/botnet/timers.txt", timerString, "w");

    await updateBotnetTask(ns, Tasks.Hack);
}

async function weakenServer(ns: NS, hostname: string): Promise<void> {
    await updateBotnetTask(ns, Tasks.Weaken);
    while (!isServerAtMinSecurity(ns, hostname)) {
        // eslint-disable-next-line no-await-in-loop
        await ns.weaken(hostname);
    }
}

function disableLogs(ns: NS): void {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerSecurityLevel");
    ns.disableLog("scan");
}
