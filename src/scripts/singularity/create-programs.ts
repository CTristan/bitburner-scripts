import { NS } from "@ns";
import * as Constants from "/classes/constants.js";
import { isWorking } from "/scripts/utils.js";

const workType = Constants.WorkTypes.CreateProgram;

/** @param {NS} ns **/
// eslint-disable-next-line require-await
export async function main(ns: NS): Promise<void> {
    let programs = [];
    for (const key in Constants.Programs) {
        const program = Constants.Programs[key];

        programs.push({
            hackLevelReq: program.hackLevelReq,
            name: program.name,
        });
    }

    /**
     * Sort the programs by hacking level required so we get the easy
     * ones done first
     */
    programs = programs.sort((a, b) => a.hackLevelReq - b.hackLevelReq);

    let creatingProgram = false;
    for (const program of programs) {
        if (
            !ns.fileExists(program.name) &&
            ns.getHackingLevel() >= program.hackLevelReq &&
            ns.createProgram(program.name)
        ) {
            creatingProgram = true;
            break;
        }
    }

    /**
     * If we have no programs left to create but are still working on one,
     * let's stop that
     */
    if (!creatingProgram && isWorking(ns, workType)) {
        ns.stopAction();
    }
}
