import { NS } from "@ns"
import { getConstants, isWorking } from "/scripts/utils.js"

const workType = getConstants().WorkTypes.Company

/**
 * Works for the most profitable company we qualify for.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const constants = getConstants()
    const companies = constants.Companies

    for (let i = 0; i < companies.length; i++) {
        const company = companies[i]
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
