import { NS } from "@ns"

/**
 * Buys any programs we can afford.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const programs = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe",
        "DeepscanV1.exe",
        "DeepscanV2.exe",
        "AutoLink.exe",
        "ServerProfiler.exe",
        "Formulas.exe",
    ]

    ns.purchaseTor()
    for (let i = 0; i < programs.length; i++) {
        const program = programs[i]
        if (!ns.fileExists(program, "home") && ns.purchaseProgram(program)) {
            // After purchasing a program, stop any action in case we're trying
            // to create the program we just bought.
            ns.stopAction()
        }
    }
}
