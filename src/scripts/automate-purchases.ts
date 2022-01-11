import { NS } from "@ns";

/**
 * Automates purchases based off of historical profit.
 * @param {NS} ns
 **/
export async function main(ns: NS): Promise<void> {
    // First argument is whether we should initialize files (for first run after Augmentation)
    const firstRun = ns.args[0] === true;
    disableLogs(ns);

    // Initialize our files on first run if needed
    const serverIncomeFile = "/data/income-servers.txt";
    const serverExpenseFile = "/data/expenses-servers.txt";
    const hacknetExpenseFile = "/data/expenses-hacknet.txt";
    if (firstRun) {
        await initializeFiles(ns, [
            serverIncomeFile,
            serverExpenseFile,
            hacknetExpenseFile,
        ]);
        ns.spawn("/scripts/automate-purchases.js");
    }

    for (;;) {
        // Get how much we've earned so far
        const serverMoneyEarned = getServerMoneyEarned(ns);
        const hacknetMoneyEarned = getHacknetMoneyEarned(ns);

        // Get how much we've spent so far
        const serverExpenses = parseFloat(await ns.read(serverExpenseFile));
        const hacknetExpenses = parseFloat(await ns.read(hacknetExpenseFile));

        // We'll only make available however much the purchases have paid for
        let serverProfits = serverMoneyEarned - serverExpenses;
        let hacknetProfits = hacknetMoneyEarned - hacknetExpenses;

        // Kickstart for first run after Augmentation
        const availableFunds = ns.getServerMoneyAvailable("home");
        if (serverProfits === 0 || availableFunds < serverProfits) {
            serverProfits = availableFunds;
        }

        if (hacknetProfits === 0 || availableFunds < hacknetProfits) {
            hacknetProfits = availableFunds;
        }

        if (
            !(await upgradeServers(ns, serverProfits, serverExpenseFile)) &&
            !(await upgradeHacknet(ns, hacknetProfits, hacknetExpenseFile))
        ) {
            // We tried to buy an upgrade but we couldn't afford one yet.
            ns.print("No purchases we can afford.");
        }

        await ns.sleep(1000);
    }
}

/**
 * Initialize report files for first run.
 * @param {NS} ns
 * @param {string[]} files The list of files to initialize.
 */
async function initializeFiles(ns: NS, files: string[]): Promise<void> {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await ns.write(file, 0, "w");
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
    let expenses = parseFloat(await ns.read(expenseFile));
    expenses += cost;

    ns.clear(expenseFile);
    await ns.write(expenseFile, expenses, "w");
}

/**
 * Gets how much income hacking has generated.
 * @param {NS} ns
 * @return Amount of money generated.
 */
function getServerMoneyEarned(ns: NS): number {
    const player = ns.getPlayer();
    const playtime = player.playtimeSinceLastAug;
    const scriptIncome = ns.getScriptIncome()[1];

    return scriptIncome * playtime;
}

/**
 * Gets how much income Hacknet has generated.
 * @param {NS} ns
 * @return How much money Hacknet has generated.
 */
function getHacknetMoneyEarned(ns: NS): number {
    let moneyEarned = 0;
    const numNodes = ns.hacknet.numNodes();
    for (let i = 0; i < numNodes; i++) {
        const node = ns.hacknet.getNodeStats(i);
        moneyEarned += node.totalProduction;
    }

    return moneyEarned;
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
    let ram = 4;
    ns.print(`Using ${availableFunds} for server upgrades.`);

    const servers = ns.getPurchasedServers();
    if (servers.length < ns.getPurchasedServerLimit()) {
        const serverCost = ns.getPurchasedServerCost(ram);
        if (serverCost <= availableFunds) {
            // Will automatically increment server name
            const serverName = ns.purchaseServer("home", ram);
            ns.exec("/scripts/worm.js", "home");
            ns.print("New server created: " + serverName);

            await addCostToExpenses(ns, serverCost, expenseFile);
            return true;
        }
    }

    const maxRam = ns.getPurchasedServerMaxRam();
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];

        // Next upgrade is always twice as much RAM
        ram = ns.getServerMaxRam(server) * 2;
        const serverCost = ns.getPurchasedServerCost(ram);
        if (serverCost <= availableFunds && ram <= maxRam) {
            ns.killall(server);
            ns.deleteServer(server);

            // Use whatever new name is given to prevent stale names in loop
            ns.purchaseServer("home", ram);
            ns.exec("/scripts/worm.js", "home");
            ns.print(
                `Replaced server ${server} with new server with ${ram}GB memory.`
            );

            await addCostToExpenses(ns, serverCost, expenseFile);
            return true;
        }
    }

    return false;
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
    ns.print(`Using ${availableFunds} for Hacknet upgrades.`);

    const hacknetNodeCost = ns.hacknet.getPurchaseNodeCost();
    if (hacknetNodeCost <= availableFunds) {
        ns.hacknet.purchaseNode();

        await addCostToExpenses(ns, hacknetNodeCost, expenseFile);
        ns.print(`Purchased a new Hacknet node for $${hacknetNodeCost}.`);
        return true;
    } else {
        const numNodes = ns.hacknet.numNodes();
        for (let i = 0; i < numNodes; i++) {
            const levelCost = ns.hacknet.getLevelUpgradeCost(i, 1);
            if (levelCost <= availableFunds) {
                ns.hacknet.upgradeLevel(i, 1);

                await addCostToExpenses(ns, levelCost, expenseFile);
                ns.print(`Upgraded a hacknet node's level for $${levelCost}`);
                return true;
            }

            const ramCost = ns.hacknet.getRamUpgradeCost(i, 1);
            if (ramCost <= availableFunds) {
                ns.hacknet.upgradeRam(i, 1);

                await addCostToExpenses(ns, ramCost, expenseFile);
                ns.print(`Upgraded a hacknet node's RAM for $${ramCost}`);
                return true;
            }

            const coreCost = ns.hacknet.getCoreUpgradeCost(i, 1);
            if (coreCost <= availableFunds) {
                ns.hacknet.upgradeCore(i, 1);

                await addCostToExpenses(ns, coreCost, expenseFile);
                ns.print(`Upgraded a hacknet node's cores for $${coreCost}`);
                return true;
            }
        }
    }

    return false;
}

function disableLogs(ns: NS): void {
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}
