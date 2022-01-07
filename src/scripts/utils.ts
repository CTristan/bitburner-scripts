import { NS } from "@ns"
import { Constants } from "/classes/constants.js"

/** @param {NS} ns */
// export async function main(ns) { }

/**
 * Connects to the specified server.
 * @param {NS} ns
 * @param {string} The server to connect to.
 * @returns True if we were able to connect to the server.
 */
export function connectTo(ns: NS, server: string, parentServer = ""): boolean {
    const hostname = ns.getCurrentServer()

    if (hostname === server) {
        return true
    }

    // Because we can only connect to neighbors, this implements
    // a tree-traversal algorithm.
    const servers = ns.scan(hostname).filter((s) => s != parentServer)
    for (let i = 0; i < servers.length; i++) {
        const currentServer = servers[i]

        if (currentServer != parentServer) {
            ns.connect(currentServer)
            if (connectTo(ns, server, hostname)) {
                return true
            }
        }
    }

    ns.connect(parentServer)
    return false
}

/**
 * Forces a script to run by constantly trying to run it until enough
 * RAM is free.
 * @param {NS} ns
 * @param {string} script Script to force to run.
 */
export async function forceRunScript(
    ns: NS,
    script: string,
    server = "home",
    ...args: Array<string | number | boolean>
): Promise<void> {
    // Sanity check that the script actually exists
    if (!ns.fileExists(script)) {
        throw new Error(
            `Invalid script \"${script}\" in forceRunScript in utils.js`
        )
    }

    if (!ns.isRunning(script, "home")) {
        let scriptStarted = runScript(ns, script, server, ...args)
        while (!scriptStarted) {
            ns.print(`Waiting to start ${script}`)
            await ns.sleep(1000)
            scriptStarted = runScript(ns, script, server, ...args)
        }
    }
}

/**
 * Returns a list of constants.
 */
export function getConstants(): Constants {
    return new Constants()
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

    return runningScript.threads
}

/**
 * Hack the server!
 * @param {NS} ns
 * **/
export async function hackServer(
    ns: NS,
    hostname: string,
    script: string,
    script2gb: string
): Promise<void> {
    // If we're already running the script then we can skip.
    if (ns.isRunning(script, hostname, "hack")) {
        return
    }

    // If we own the server then we don't need to actually hack it
    const server = ns.getServer(hostname)
    if (!server.purchasedByPlayer && !server.backdoorInstalled) {
        // Number of ports we can open
        const portOpeners = [
            "BruteSSH.exe",
            "FTPCrack.exe",
            "relaySMTP.exe",
            "HTTPWorm.exe",
            "SQLInject.exe",
        ]
        let openablePorts = 0
        for (let i = 0; i < portOpeners.length; i++) {
            if (ns.fileExists(portOpeners[i], "home")) {
                openablePorts++
            }
        }

        // Ports required to open the server
        const requiredPorts = ns.getServerNumPortsRequired(hostname)

        // Make sure we can actually hack this server
        if (
            ns.getServerRequiredHackingLevel(hostname) > ns.getHackingLevel() ||
            requiredPorts > openablePorts
        ) {
            ns.print(hostname + " is not currently hackable. Skipping.")
            return
        }
        ns.print("Hacking " + hostname)

        // First check if we're rooted or not
        if (!ns.hasRootAccess(hostname)) {
            if (requiredPorts > 0) {
                ns.brutessh(hostname)
            }
            if (requiredPorts > 1) {
                ns.ftpcrack(hostname)
            }
            if (requiredPorts > 2) {
                ns.relaysmtp(hostname)
            }
            if (requiredPorts > 3) {
                ns.httpworm(hostname)
            }
            if (requiredPorts > 4) {
                ns.sqlinject(hostname)
            }
            ns.nuke(hostname)
        }

        await forceRunScript(
            ns,
            "/scripts/singularity/install-backdoor.js",
            "home",
            hostname
        )
    }

    // Utils needed for all servers
    await ns.scp("/scripts/utils.js", "home", hostname)
    await ns.scp("/classes/constants.js", "home", hostname)

    // We want to dedicate the first three scripts to a specific task, so we
    // need to make sure there's enough memory for at least those.
    const serverMaxRam = ns.getServerMaxRam(hostname)
    const scriptRam = ns.getScriptRam(script)
    const initialScriptsRam = scriptRam * 3

    // Special case for servers with less than 16GB RAM
    if (serverMaxRam < 4 && !ns.isRunning(script2gb, hostname)) {
        // 2GB servers get their own script
        await ns.scp(script2gb, "home", hostname)
        ns.exec(script2gb, hostname)

        return
    } else if (
        serverMaxRam < initialScriptsRam &&
        !ns.isRunning(script, hostname)
    ) {
        // Only one or two script instances can fit, so just fill up the threads
        // and have it hack
        const threads = Math.max(Math.floor(serverMaxRam / scriptRam), 1)
        await ns.scp(script, "home", hostname)
        ns.exec(script, hostname, threads, "hack")

        return
    }

    await ns.scp(script, "home", hostname)

    // Make sure we don't clog up the server with hundreds of processes
    const maxProcesses = 99
    let threads = Math.max(
        Math.ceil(serverMaxRam / scriptRam / maxProcesses),
        1
    )

    // Dedicate the first three scripts to a specific task
    ns.exec(script, hostname, threads, "hack")
    ns.exec(script, hostname, threads, "weaken")
    ns.exec(script, hostname, threads, "grow")

    let serverUsedRam = ns.getServerUsedRam(hostname)
    let serverRam = serverMaxRam - serverUsedRam

    let scriptCount = 0
    while (serverRam > scriptRam) {
        /**
         * Need to check for failed exec due to out of RAM to prevent infinite
         * loop. Usually happens on the last instance where there's still
         * available RAM but not enough for the full number of threads.
         */
        let processId = ns.exec(script, hostname, threads, scriptCount)
        while (processId == 0) {
            threads--
            processId = ns.exec(script, hostname, threads, scriptCount)
        }

        scriptCount++
        serverUsedRam = ns.getServerUsedRam(hostname)
        serverRam = serverMaxRam - serverUsedRam
    }
}

/**
 * Returns whether or not we own the server (home or purchased).
 * @param {string} hostname The server's hostname.
 * @return True if we own the server.
 */
export function isServerOwned(hostname: string): boolean {
    return hostname.substring(0, 4) == "home"
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
        threads -= 3
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
    // Start our scanning with the current server
    let servers = [ns.getHostname()]
    let scanIndex = 0

    ns.print("Scanning for all servers.")
    do {
        // Scan reachable servers for any new servers
        const scanList = ns.scan(servers[scanIndex])

        for (let i = 0; i < scanList.length; i++) {
            const server = scanList[i]

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

/**
 * Checks if we're still performing the work that we want to stop.
 * @param {NS} ns
 * @param {string} workType
 */
export function stopWork(ns: NS, workType: string): void {
    const player = ns.getPlayer()

    if (player.workType === workType) {
        ns.stopAction()
    }
}
