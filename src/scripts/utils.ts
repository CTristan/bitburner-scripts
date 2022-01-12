import { NS } from "@ns";

/**
 * Connects to the specified server.
 * @param {NS} ns
 * @param {string} The server to connect to.
 * @returns True if we were able to connect to the server.
 */
export function connectTo(ns: NS, server: string, parentServer = ""): boolean {
    const hostname = ns.getCurrentServer();

    if (hostname === server) {
        return true;
    }

    // Because we can only connect to neighbors, this implements
    // a tree-traversal algorithm.
    const servers = ns.scan(hostname).filter((s) => s != parentServer);
    for (let i = 0; i < servers.length; i++) {
        const currentServer = servers[i];

        if (currentServer != parentServer) {
            ns.connect(currentServer);
            if (connectTo(ns, server, hostname)) {
                return true;
            }
        }
    }

    ns.connect(parentServer);
    return false;
}

/**
 * Forces a script to run by constantly trying to run it until enough
 * RAM is free.
 *
 * If the server's max RAM is too small then this will return false as we will
 * never be able to run the script.
 *
 * @param {NS} ns
 * @param {string} script Script to force to run.
 * @returns True if the script was successful.
 */
export async function forceRunScript(
    ns: NS,
    script: string,
    server = "home",
    ...args: Array<string | number | boolean>
): Promise<boolean> {
    // Sanity check that the script actually exists
    if (!ns.fileExists(script)) {
        throw new Error(
            `Invalid script "${script}" in forceRunScript in utils.js`
        );
    }

    // If the script would use more than 20% of the server's max RAM, let's
    // skip it since it may never run
    const serverMaxRam = ns.getServerMaxRam(server),
        scriptRam = ns.getScriptRam(script);

    if (scriptRam > serverMaxRam * 0.2) {
        ns.print(
            `Will not run script ${script} because it requires ` +
                `${scriptRam}GB which is more than 20% of the ${serverMaxRam}GB ` +
                `available on ${server}`
        );
        return false;
    }

    if (!ns.scriptRunning(script, server)) {
        let scriptStarted = runScript(ns, script, server, ...args);
        while (!scriptStarted) {
            ns.print(`Waiting to start ${script}`);
            await ns.sleep(1000);
            scriptStarted = runScript(ns, script, server, ...args);
        }
    }

    return true;
}

/**
 * Gets the number of threads being used for the current script.
 * Does not currently support scripts with args.
 * @param {NS} ns
 * @return The number of threads currently being used by this script.
 */
export function getThreadCount(ns: NS): number {
    const serverName = ns.getHostname(),
        scriptName = ns.getScriptName(),
        runningScript = ns.getRunningScript(scriptName, serverName);

    return runningScript.threads;
}

/**
 * Returns whether or not we own the server (home or purchased).
 * @param {string} hostname The server's hostname.
 * @return True if we own the server.
 */
export function isServerOwned(hostname: string): boolean {
    return hostname.substring(0, 4) == "home";
}

export function isWorking(ns: NS, workType: string): boolean {
    return ns.getPlayer().workType === workType;
}

/**
 * If enough RAM is available then restart the script with the maximum number of threads available.
 * Does not currently support scripts with args.
 * @param {NS} ns
 * @return The number of threads being used currently if we didn't restart.
 * **/
export function restartWithMaxThreadsIfPossible(ns: NS): number {
    const serverName = ns.getHostname(),
        scriptName = ns.getScriptName(),
        maxRam = ns.getServerMaxRam(serverName),
        usedRam = ns.getServerUsedRam(serverName),
        availableRam = maxRam - usedRam,
        memCost = ns.getScriptRam(scriptName);
    let threads = Math.floor(availableRam / memCost);

    // On our home server we need to reserve some threads for other scripts we might want to run
    if (serverName == "home") {
        threads -= 4;
    } else {
        // On every server, max out the threads.
        threads++;
    }

    // Make sure we're not already running at max threads before restarting
    const currentThreadCount = getThreadCount(ns);
    if (threads > currentThreadCount) {
        ns.spawn(scriptName, threads);
    }

    return currentThreadCount;
}

/**
 * Runs the script if it exists and is not currently running.
 * @param ns
 * @param scriptName The script to run.
 * @param server The server to run the script on. Defaults to home.
 * @param args Args to run the script with. Optional.
 * @returns True if the script was successfully started and was not already running.
 */
export function runScript(
    ns: NS,
    scriptName: string,
    hostname = "home",
    ...args: Array<string | number | boolean>
): boolean {
    if (
        ns.fileExists(scriptName, hostname) &&
        !ns.isRunning(scriptName, hostname)
    ) {
        const pid = ns.exec(scriptName, hostname, 1, ...args);
        return pid > 0;
    }

    return false;
}

/**
 * Scans for any all reachable servers to add.
 * @param {NS} ns
 * @param {boolean} includeOwnedServers Whether to include owned servers in the results. Default is false.
 * @return The list of servers found.
 **/
export function scanForAllServers(
    ns: NS,
    includeOwnedServers = false
): string[] {
    // Start our scanning with the current server
    let servers = [ns.getHostname()];
    let scanIndex = 0;

    ns.print("Scanning for all servers.");
    do {
        // Scan reachable servers for any new servers
        const scanList = ns.scan(servers[scanIndex]);

        for (let i = 0; i < scanList.length; i++) {
            const server = scanList[i];

            // Make sure we don't already have this server in our list
            if (servers.indexOf(server) == -1) {
                servers.push(server);
            }
        }
        scanIndex++;

        // If we're at the end, reset the index so we can exit the loop
        if (scanIndex > servers.length) {
            scanIndex = 0;
        }
    } while (scanIndex > 0);

    // Remove owned servers (unless we want them)
    if (!includeOwnedServers) {
        servers = servers.filter((server) => !isServerOwned(server));
    }

    ns.print(servers.length + " servers found.");
    return servers;
}
