import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { isPostSingularity } from "/scripts/utils"

/**
 * Buys any programs we can afford.
 *
 * @param {NS} ns
 */
// eslint-disable-next-line require-await
export async function main(ns: NS): Promise<void> {
    ns.purchaseTor()
    for (const key in Constants.Programs) {
        const program = Constants.Programs[key]

        if (isPostSingularity(ns) && !program.postSingularity) {
            continue
        }

        ns.purchaseProgram(program.name)
    }
}
