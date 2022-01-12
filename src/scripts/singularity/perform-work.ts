import { NS } from "@ns";
import * as Constants from "/classes/constants.js";
import { forceRunScript } from "/scripts/utils.js";

/**
 * Perform the next work that is important.
 *
 * Priority:
 * 1. Create Program
 * 2. Factions
 * 3. Crime
 * 4. Companies
 * 5. Study or Workout
 *
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
    const WorkTypes = Constants.WorkTypes;
    const prioritizedWork = [
        WorkTypes.CreateProgram,
        WorkTypes.Factions,
        WorkTypes.Company,
        WorkTypes.Crime,
        WorkTypes.StudyClass,
    ];

    // As we work through the priority list, we'll add them to a whitelist of
    // work types that we don't want to interrupt.
    const whitelist = [];
    for (let i = 0; i < prioritizedWork.length; i++) {
        const workType = prioritizedWork[i];

        switch (workType) {
            case WorkTypes.CreateProgram:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/create-programs.js",
                    ...whitelist
                );
                break;
            case WorkTypes.Company:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/work-companies.js",
                    ...whitelist
                );
                break;
            case WorkTypes.Crime:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/commit-crime.js",
                    ...whitelist
                );
                break;
            case WorkTypes.Factions:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/work-factions.js",
                    ...whitelist
                );
                break;
            case WorkTypes.StudyClass:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/raise-lowest-stat.js",
                    ...whitelist
                );
                break;
            default:
                throw new Error(
                    `Attempted to perform work ${workType} but this work type
                is not implemented.`
                );
        }

        whitelist.push(workType);
        console.log(whitelist);
    }
}

/**
 * Checks if we can and should perform the work.
 *
 * @param ns NS
 * @param script The script that will perform the work.
 * @param whitelist Whitelist of work types that we don't want to interrupt.
 */
export async function attemptToPerformWork(
    ns: NS,
    script: string,
    ...whitelist: Array<string>
): Promise<void> {
    // Check if we are currently working on a whitelisted work type
    const currentWorkType = ns.getPlayer().workType;
    if (whitelist.indexOf(currentWorkType) > -1) {
        ns.exit();
    }

    await forceRunScript(ns, script, "home");

    // Wait for a second to allow the script to run and start work before
    // before continuing on.
    await ns.sleep(1000);
}
