import { NS, Server } from "@ns";
import { forceRunScript, scanForAllServers } from "/scripts/utils.js";

/**
 * Scans all hackable servers, roots them and installs hacking scripts on them.
 * @param {NS} ns
 **/
export async function main(ns: NS): Promise<void> {
    // First arg is whether or not to force a script update on all servers
    const forceScriptUpdate = ns.args.length > 0 ? ns.args[0] : false;
    disableLogs(ns);

    // The script name to infect every server with.
    const scripts = ["/scripts/loop.js"],
        // Infect all servers, including purchased servers.
        servers = scanForAllServers(ns, true).filter(
            (server) => server != "home"
        );

    let scriptNumber = 0;
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];

        if (forceScriptUpdate) {
            ns.killall(server);
        }

        ns.print("About to infect " + server);
        scriptNumber = await hackServer(ns, server, scripts, scriptNumber);
    }
}

/**
 * Hack the server!
 *
 * @param {NS} ns
 * @param hostname The server to hack.
 * @param scripts The payload. The first script in the list MUST be the main
 * script coordinator.
 * @param scriptNumber How many scripts we've deployed so far. Needed for
 * timing the botnet.
 * @returns The script number of the last script executed.
 * **/
export async function hackServer(
    ns: NS,
    hostname: string,
    scripts: string[],
    scriptNumber: number
): Promise<number> {
    // Root the server before infecting it
    const server = ns.getServer(hostname);
    await rootServer(ns, server);

    // We need to make sure there's enough memory, so we'll skip any servers
    // that don't have enough RAM
    const serverMaxRam = ns.getServerMaxRam(hostname);
    let scriptsRam = 0;
    for (const script of scripts) {
        scriptsRam += ns.getScriptRam(script);
        await ns.scp(script, "home", hostname);
    }
    if (serverMaxRam < scriptsRam) return scriptNumber;

    // Make sure we don't clog up the server with hundreds of processes
    const maxProcesses = 99;
    let threads = Math.max(
        Math.ceil(serverMaxRam / scriptsRam / maxProcesses),
        1
    );

    let serverUsedRam = ns.getServerUsedRam(hostname);
    let serverRam = serverMaxRam - serverUsedRam;

    while (serverRam > scriptsRam) {
        /**
         * Need to check for failed exec due to out of RAM to prevent infinite
         * loop. Usually happens on the last instance where there's still
         * available RAM but not enough for the full number of threads.
         */
        let processId = ns.exec(scripts[0], hostname, threads, scriptNumber);
        while (processId == 0) {
            threads--;

            if (threads === 0) return scriptNumber;

            processId = ns.exec(scripts[0], hostname, threads, scriptNumber);
        }

        scriptNumber++;
        serverUsedRam = ns.getServerUsedRam(hostname);
        serverRam = serverMaxRam - serverUsedRam;
    }

    return scriptNumber;
}

async function rootServer(ns: NS, server: Server): Promise<void> {
    // If we own the server then we don't need to actually root it
    if (!server.purchasedByPlayer && !server.backdoorInstalled) {
        // Number of ports we can open
        const portOpeners = [
            "BruteSSH.exe",
            "FTPCrack.exe",
            "relaySMTP.exe",
            "HTTPWorm.exe",
            "SQLInject.exe",
        ];
        let openablePorts = 0;
        for (let i = 0; i < portOpeners.length; i++) {
            if (ns.fileExists(portOpeners[i], "home")) {
                openablePorts++;
            }
        }

        // Ports required to open the server
        const requiredPorts = ns.getServerNumPortsRequired(server.hostname);

        // Make sure we can actually hack this server
        if (
            ns.getServerRequiredHackingLevel(server.hostname) >
                ns.getHackingLevel() ||
            requiredPorts > openablePorts
        ) {
            ns.print(server.hostname + " is not currently rootable. Skipping.");
            return;
        }
        ns.print("Hacking " + server.hostname);

        // First check if we're rooted or not
        if (!ns.hasRootAccess(server.hostname)) {
            if (requiredPorts > 0) {
                ns.brutessh(server.hostname);
            }
            if (requiredPorts > 1) {
                ns.ftpcrack(server.hostname);
            }
            if (requiredPorts > 2) {
                ns.relaysmtp(server.hostname);
            }
            if (requiredPorts > 3) {
                ns.httpworm(server.hostname);
            }
            if (requiredPorts > 4) {
                ns.sqlinject(server.hostname);
            }
            ns.nuke(server.hostname);
        }

        await forceRunScript(
            ns,
            "/scripts/singularity/install-backdoor.js",
            "home",
            server.hostname
        );
    }

    // Utils needed for all servers
    await ns.scp("/scripts/utils.js", "home", server.hostname);
    await ns.scp("/classes/constants.js", "home", server.hostname);
}

/** @param {NS} ns */
function disableLogs(ns: NS): void {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerNumPortsRequired");
    ns.disableLog("getServerRequiredHackingLevel");
    ns.disableLog("scan");
}
