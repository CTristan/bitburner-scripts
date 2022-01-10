import { NS } from "@ns";
import * as Constants from "/classes/constants.js";
import { isWorking } from "/scripts/utils.js";

const Programs = Constants.Programs;
const workType = Constants.WorkTypes.CreateProgram;

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    let programs = [];
    for (const key in Programs) {
        const program = Programs[key];
        programs.push({
            name: program.name,
            hackLevelReq: program.hackLevelReq,
        });
    }

    // Sort the programs by hacking level required so we get the easy
    // ones done first
    programs = programs.sort((a, b) => a.hackLevelReq - b.hackLevelReq);

    for (const program of programs)
        if (
            !ns.fileExists(program.name) &&
            ns.getHackingLevel() >= program.hackLevelReq &&
            ns.createProgram(program.name)
        ) {
            // Keep checking that we haven't bought the program since starting
            // to create the program
            while (!ns.fileExists(program.name) && isWorking(ns, workType)) {
                await ns.sleep(1000);
            }

            // We're done writing the program, let's exit so we don't
            // interrupt anything else
            ns.exit();
        }
}
