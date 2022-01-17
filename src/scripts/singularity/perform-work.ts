import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { forceRunScript } from "/scripts/utils.js"

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
    const WorkTypes = Constants.WorkTypes
    const prioritizedWork = [
        WorkTypes.CreateProgram,
        WorkTypes.Factions,
        WorkTypes.Company,
        WorkTypes.Crime,
        WorkTypes.StudyClass,
    ]

    /**
     * As we work through the work list, we'll add them to a priority list of
     * work types that we don't want to interrupt.
     * Needs to run sequentially
     */
    /* eslint-disable no-await-in-loop */
    const priorityList = []
    for (let i = 0; i < prioritizedWork.length; i++) {
        const workType = prioritizedWork[i]

        switch (workType) {
            case WorkTypes.CreateProgram:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/create-programs.js",
                    ...priorityList
                )
                break
            case WorkTypes.Company:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/work-companies.js",
                    ...priorityList
                )
                break
            case WorkTypes.Crime:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/commit-crime.js",
                    ...priorityList
                )
                break
            case WorkTypes.Factions:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/work-factions.js",
                    ...priorityList
                )
                break
            case WorkTypes.StudyClass:
                await attemptToPerformWork(
                    ns,
                    "/scripts/singularity/raise-lowest-stat.js",
                    ...priorityList
                )
                break
            default:
                throw new Error(
                    `Attempted to perform work ${workType} but this work type
                is not implemented.`
                )
        }

        priorityList.push(workType)
        console.log(priorityList)
    }
    /* eslint-enable no-await-in-loop */
}

/**
 * Checks if we can and should perform the work.
 *
 * @param ns NS
 * @param script The script that will perform the work.
 * @param priorityList List of work types that we don't want to interrupt.
 */
export async function attemptToPerformWork(
    ns: NS,
    script: string,
    ...priorityList: Array<string>
): Promise<void> {
    // Check if we are currently working on a priorityListed work type
    const currentWorkType = ns.getPlayer().workType
    if (priorityList.indexOf(currentWorkType) > -1) {
        ns.print(
            `Checked if we should run ${script} but stopped because we're ` +
                `${currentWorkType} which is higher in priority.`
        )
        ns.exit()
    }

    await forceRunScript(ns, script, "home")

    /**
     * Wait for a second to allow the script to run and start work before
     * before continuing on.
     */
    await ns.sleep(1000)
}
