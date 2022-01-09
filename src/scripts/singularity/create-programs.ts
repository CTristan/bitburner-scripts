import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { isWorking } from "/scripts/utils.js"

const Programs = Constants.Programs
const workType = Constants.WorkTypes.CreateProgram

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    for (const key in Programs) {
        const program = Programs[key]
        if (
            !ns.fileExists(program.name) &&
            ns.getHackingLevel() >= program.hackLevelReq &&
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
