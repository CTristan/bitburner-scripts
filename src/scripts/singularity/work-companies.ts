import { NS } from "@ns"
import { getConstants } from "/scripts/utils.js"

/**
 * Works for the most profitable company we qualify for.
 * Only activates if we're not busy with something else.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const constants = getConstants()
    const companies = constants.Companies

    for (let i = 0; i < companies.length; i++) {
        const company = companies[i]

        if (ns.getCompanyRep(company.name) < company.repReq) {
            ns.applyToCompany(company.name, "Software")
            const focus = ns.isFocused()

            // Work for the company until you earn 1k rep
            if (ns.workForCompany(company.name, focus)) {
                const favor = ns.getCompanyFavor(company.name)
                const repGain = (100 + favor) / 100
                const repDesired = 1000
                const cancelEarlyPenalty = 1 / 2
                const sleepTimer =
                    (1000 * repDesired * repGain) / cancelEarlyPenalty

                await ns.sleep(sleepTimer)

                return
            }
        }
    }
}
