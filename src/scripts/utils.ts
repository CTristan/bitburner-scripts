import { NS } from "@ns"

/**
 * Connects to the specified server.
 * @param {NS} ns
 * @param {string} The server to connect to.
 * @returns True if we were able to connect to the server.
 */
export function connectTo(ns: NS, server: string, parentServer = ""): boolean {
    const hostname = ns.singularity.getCurrentServer()

    if (hostname === server) {
        return true
    }

    /**
     * Because we can only connect to neighbors, this implements
     * a tree-traversal algorithm.
     */
    const servers = ns.scan(hostname).filter((s) => s != parentServer)
    for (let i = 0; i < servers.length; i++) {
        const currentServer = servers[i]

        if (currentServer != parentServer) {
            ns.singularity.connect(currentServer)
            if (connectTo(ns, server, hostname)) {
                return true
            }
        }
    }

    ns.singularity.connect(parentServer)
    return false
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
        )
    }

    /**
     * If the script would use more than 20% of the server's max RAM, let's
     * skip it since it may never run
     */
    const serverMaxRam = ns.getServerMaxRam(server)
    const scriptRam = ns.getScriptRam(script)

    if (scriptRam > serverMaxRam * 0.2) {
        ns.print(
            `Will not run script ${script} because it requires ` +
            `${scriptRam}GB which is more than 20% of the ${serverMaxRam}GB ` +
            `available on ${server}`
        )
        return false
    }

    // TODO: When this is fixed upstream, change to use the same ...args
    const argsString = args.map((arg) => (arg = arg.toString()))

    if (!ns.isRunning(script, server, ...argsString)) {
        let scriptStarted = runScript(ns, script, server, ...args)
        while (!scriptStarted) {
            ns.print(`Waiting to start ${script}`)
            // eslint-disable-next-line no-await-in-loop
            await ns.sleep(1000)
            scriptStarted = runScript(ns, script, server, ...args)
        }
    }

    return true
}

/**
 * Gets the number of threads being used for the current script.
 * Does not currently support scripts with args.
 * @param {NS} ns
 * @return The number of threads currently being used by this script.
 */
export function getThreadCount(ns: NS): number {
    const serverName = ns.getHostname()
    const scriptName = ns.getScriptName()
    const runningScript = ns.getRunningScript(scriptName, serverName)

    return runningScript ? runningScript.threads : 0
}

/**
 * Checks if the player is currently focused and is working on the specified work type already.
 * If they're focused but working on another work type then we want to focus on the new work type.
 * 
 * @param ns ns
 * @param {string} workType The type of work we're going to start.
 * @returns True if the player is focused and already working on the specified work type
 */
export function isFocused(ns: NS, workType: string): boolean {
    const currentWorkType = ns.getPlayer().workType

    return currentWorkType !== workType || ns.singularity.isFocused()
}

/**
 * Returns whether or not we have access to the Singularity functions.
 * @param ns ns
 * @returns True if we are in the Singularity.
 */
export function isPostSingularity(ns: NS): boolean {
    const singularityBitNode = 4

    // First check if we are in the Singularity BitNode, since it won't appear
    // in the owned source files if we're in 4-1
    if (ns.getPlayer().bitNodeN === singularityBitNode) {
        return true
    }

    for (const sourceFile of ns.getOwnedSourceFiles()) {
        if (sourceFile.n === singularityBitNode) {
            return true
        }
    }

    return false
}

/**
 * Returns whether or not we own the server (home or purchased).
 * @param {string} hostname The server's hostname.
 * @return True if we own the server.
 */
export function isServerOwned(hostname: string): boolean {
    return hostname.substring(0, 4) == "home"
}

export function isWorking(ns: NS, workType: string): boolean {
    return ns.getPlayer().workType === workType
}

/**
 * If enough RAM is available then restart the script with the maximum number of threads available.
 * Does not currently support scripts with args.
 * @param {NS} ns
 * @return The number of threads being used currently if we didn't restart.
 * **/
export function restartWithMaxThreadsIfPossible(ns: NS): number {
    const serverName = ns.getHostname()
    const scriptName = ns.getScriptName()

    const maxRam = ns.getServerMaxRam(serverName)
    const usedRam = ns.getServerUsedRam(serverName)
    const availableRam = maxRam - usedRam

    const memCost = ns.getScriptRam(scriptName)
    let threads = Math.floor(availableRam / memCost)

    // On our home server we need to reserve some threads for other scripts we might want to run
    if (serverName == "home") {
        threads -= 4
    } else {
        // On every server, max out the threads.
        threads++
    }

    // Make sure we're not already running at max threads before restarting
    const currentThreadCount = getThreadCount(ns)
    if (threads > currentThreadCount) {
        ns.spawn(scriptName, threads)
    }

    return currentThreadCount
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
        const pid = ns.exec(scriptName, hostname, 1, ...args)
        return pid > 0
    }

    return false
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
    // Start our scanning with the home server
    let servers = ["home"]
    let scanIndex = 0

    ns.print("Scanning for all servers.")
    do {
        // Scan reachable servers for any new servers
        const scanList = ns.scan(servers[scanIndex])

        for (const server of scanList) {
            // Make sure we don't already have this server in our list
            if (servers.indexOf(server) == -1) {
                servers.push(server)
            }
        }
        scanIndex++

        // If we're at the end, reset the index so we can exit the loop
        if (scanIndex > servers.length) {
            scanIndex = 0
        }
    } while (scanIndex > 0)

    // Remove owned servers (unless we want them)
    if (!includeOwnedServers) {
        servers = servers.filter((server) => !isServerOwned(server))
    }

    ns.print(servers.length + " servers found.")
    return servers
}
