import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { isWorking } from "/scripts/utils.js"

const Companies = Constants.Companies

const workType = Constants.WorkTypes.Company

/**
 * Works for the most profitable company we qualify for.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    for (const key in Companies) {
        const company = Companies[key]

        ns.applyToCompany(company.name, "Software")

        if (
            ns.getCompanyRep(company.name) < company.repReq &&
            ns.workForCompany(company.name, ns.isFocused())
        ) {
            // Work until we meet the reputation requirement or start working
            // on something else
            while (
                ns.getCompanyRep(company.name) < company.repReq &&
                isWorking(ns, workType)
            ) {
                if (ns.applyToCompany(company.name, "Software")) {
                    ns.workForCompany(company.name, ns.isFocused())
                }

                // Sleep until we gain 1000 rep (taking the early cancel penalty
                // into account) or start working on something else
                while (
                    ns.getPlayer().workRepGained < 1000 * 2 &&
                    isWorking(ns, workType)
                ) {
                    await ns.sleep(1000)
                }
            }
        }
    }

    // If we're still working at a company, we can stop now
    if (isWorking(ns, workType)) {
        ns.stopAction()
    }
}
