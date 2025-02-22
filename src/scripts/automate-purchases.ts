import { NS } from "@ns"

/**
 * Automates purchases based off of historical profit.
 * @param {NS} ns
 **/
export async function main(ns: NS): Promise<void> {
    // First argument is whether we should initialize files (for first run after Augmentation)
    const firstRun = ns.args[0] === true
    disableLogs(ns)

    // Initialize our files on first run if needed
    const serverIncomeFile = "/data/income-servers.txt"
    const serverExpenseFile = "/data/expenses-servers.txt"
    const hacknetExpenseFile = "/data/expenses-hacknet.txt"

    if (firstRun) {
        await initializeFiles(ns, [
            serverIncomeFile,
            serverExpenseFile,
            hacknetExpenseFile,
        ])
        ns.spawn("/scripts/automate-purchases.js")
    }

    // Since this is an infinite loop, we want to run everything sequentially.
    /* eslint-disable no-await-in-loop */
    for (;;) {
        // Get how much we've earned so far
        const serverMoneyEarned = getServerMoneyEarned(ns)
        const hacknetMoneyEarned = getHacknetMoneyEarned(ns)

        // Get how much we've spent so far
        const serverExpenses = parseFloat(await ns.read(serverExpenseFile))
        const hacknetExpenses = parseFloat(await ns.read(hacknetExpenseFile))

        // We'll only make available however much the purchases have paid for
        let serverProfits = serverMoneyEarned - serverExpenses
        let hacknetProfits = hacknetMoneyEarned - hacknetExpenses

        // Kickstart for first run after Augmentation
        const availableFunds = ns.getServerMoneyAvailable("home")
        if (serverProfits === 0 || availableFunds < serverProfits) {
            serverProfits = availableFunds
        }

        if (hacknetProfits === 0 || availableFunds < hacknetProfits) {
            hacknetProfits = availableFunds
        }

        if (
            !(await upgradeServers(ns, serverProfits, serverExpenseFile)) &&
            !(await upgradeHacknet(ns, hacknetProfits, hacknetExpenseFile))
        ) {
            // We tried to buy an upgrade but we couldn't afford one yet.
            ns.print("No purchases we can afford.")
        }

        await ns.sleep(1000)
    }
    /* eslint-enable no-await-in-loop */
}

/**
 * Initialize report files for first run.
 * @param {NS} ns
 * @param {string[]} files The list of files to initialize.
 */
async function initializeFiles(ns: NS, files: string[]): Promise<void> {
    for (const file of files) {
        await ns.write(file, 0, "w")
    }
}

/**
 * Adds the cost of the upgrade to our expenses.
 * @param {NS} ns
 * @param {number} cost How much the upgrade costs.
 * @param {string} expenseFile The file to use for expense reporting.
 */
async function addCostToExpenses(
    ns: NS,
    cost: number,
    expenseFile: string
): Promise<void> {
    let expenses = parseFloat(await ns.read(expenseFile))
    expenses += cost

    ns.clear(expenseFile)
    await ns.write(expenseFile, expenses, "w")
}

/**
 * Gets how much income hacking has generated.
 * @param {NS} ns
 * @return Amount of money generated.
 */
function getServerMoneyEarned(ns: NS): number {
    const player = ns.getPlayer()
    const playtime = player.playtimeSinceLastAug
    const scriptIncome = ns.getScriptIncome()[1]

    return scriptIncome * playtime
}

/**
 * Gets how much income Hacknet has generated.
 * @param {NS} ns
 * @return How much money Hacknet has generated.
 */
function getHacknetMoneyEarned(ns: NS): number {
    let moneyEarned = 0
    const numNodes = ns.hacknet.numNodes()
    for (let i = 0; i < numNodes; i++) {
        const node = ns.hacknet.getNodeStats(i)
        moneyEarned += node.totalProduction
    }

    return moneyEarned
}

/**
 * Checks for any purchasable server upgrades.
 *
 * @param ns
 * @param availableFunds How much we have available to spend.
 * @param expenseFile The file used for expense reporting.
 * @return True if a server was purchased.
 */
async function upgradeServers(
    ns: NS,
    availableFunds: number,
    expenseFile: string
): Promise<boolean> {
    // We only want servers with enough ram to run our batching scripts
    let ram = 4
    ns.print(`Using ${availableFunds} for server upgrades.`)

    const servers = ns.getPurchasedServers()
    if (servers.length < ns.getPurchasedServerLimit()) {
        const serverCost = ns.getPurchasedServerCost(ram)
        if (serverCost <= availableFunds) {
            // Will automatically increment server name
            const serverName = ns.purchaseServer("home", ram)
            ns.exec("/scripts/worm.js", "home")
            ns.print("New server created: " + serverName)

            await addCostToExpenses(ns, serverCost, expenseFile)
            return true
        }
    }

    const maxRam = ns.getPurchasedServerMaxRam()
    let totalCost = 0
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i]

        // Next upgrade is always twice as much RAM
        ram = ns.getServerMaxRam(server) * 2
        const serverCost = ns.getPurchasedServerCost(ram)
        if (serverCost <= availableFunds && ram <= maxRam) {
            ns.killall(server)
            ns.deleteServer(server)

            // Use whatever new name is given to prevent stale names in loop
            ns.purchaseServer("home", ram)
            ns.exec("/scripts/worm.js", "home")
            ns.print(
                `Replaced server ${server} with new server with ${ram}GB memory.`
            )

            availableFunds -= serverCost
            totalCost += serverCost
        }
    }

    if (totalCost > 0) {
        await addCostToExpenses(ns, totalCost, expenseFile)
        return true
    }

    return false
}

/**
 * Checks for any purchasable Hacknet upgrades.
 * @param {NS} ns
 * @param {number} availableFunds How much we have to spend.
 * @param {string} expenseFile The file used for expense reporting.
 * @return True if an upgrade was purchased.
 */
async function upgradeHacknet(
    ns: NS,
    availableFunds: number,
    expenseFile: string
): Promise<boolean> {
    ns.print(`Using ${availableFunds} for Hacknet upgrades.`)

    const hacknetNodeCost = ns.hacknet.getPurchaseNodeCost()
    let totalCost = 0
    if (hacknetNodeCost <= availableFunds) {
        ns.hacknet.purchaseNode()
        totalCost += hacknetNodeCost
        ns.print(`Purchased a new Hacknet node for $${hacknetNodeCost}.`)
    } else {
        const numNodes = ns.hacknet.numNodes()
        for (let i = 0; i < numNodes; i++) {
            let cost = ns.hacknet.getLevelUpgradeCost(i, 1)
            if (cost <= availableFunds) {
                ns.hacknet.upgradeLevel(i, 1)

                availableFunds -= cost
                totalCost += cost
                ns.print(`Upgraded a hacknet node's level for $${cost}`)
            }

            cost = ns.hacknet.getRamUpgradeCost(i, 1)
            if (cost <= availableFunds) {
                ns.hacknet.upgradeRam(i, 1)

                availableFunds -= cost
                totalCost += cost
                ns.print(`Upgraded a hacknet node's RAM for $${cost}`)
            }

            cost = ns.hacknet.getCoreUpgradeCost(i, 1)
            if (cost <= availableFunds) {
                ns.hacknet.upgradeCore(i, 1)

                availableFunds -= cost
                totalCost += cost
                ns.print(`Upgraded a hacknet node's cores for $${cost}`)
            }
        }
    }

    if (totalCost > 0) {
        await addCostToExpenses(ns, totalCost, expenseFile)
        return true
    }

    return false
}

function disableLogs(ns: NS): void {
    ns.disableLog("getServerMaxRam")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("sleep")
}
