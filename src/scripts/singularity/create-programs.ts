import { NS } from "@ns"
import { getConstants, isWorking } from "/scripts/utils.js"

const workType = getConstants().WorkTypes.CreateProgram

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const constants = getConstants()
    const Programs = constants.Programs

    const hackLevel = ns.getHackingLevel()
    for (let i = 0; i < Programs.length; i++) {
        const program = Programs[i]

        if (
            !ns.fileExists(program.name) &&
            hackLevel >= program.hackLevelReq &&
            ns.createProgram(program.name)
        ) {
            // Keep checking that we haven't bought the program since starting
            // to create the program
            while (!ns.fileExists(program.name) && isWorking(ns, workType)) {
                await ns.sleep(1000)
            }
        }
    }
}
