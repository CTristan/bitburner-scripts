import { NS } from "@ns"
import { getConstants } from "/scripts/utils.js"

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const constants = getConstants()
    const Programs = constants.Programs
    const WorkTypes = constants.WorkTypes

    const hackLevel = ns.getHackingLevel()
    for (let i = 0; i < Programs.length; i++) {
        const program = Programs[i]

        if (
            !ns.fileExists(program.name) &&
            hackLevel >= program.hackLevelReq &&
            ns.createProgram(program.name)
        ) {
            // Keep checking that we haven't bought the program since starting to create the program
            let workType = ns.getPlayer().workType
            while (
                !ns.fileExists(program.name) &&
                workType === WorkTypes.CreateProgram
            ) {
                await ns.sleep(1000)
                workType = ns.getPlayer().workType
            }
        }
    }
}
