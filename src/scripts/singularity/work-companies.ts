import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { IPosition } from "/interfaces/iposition.js"
import { isWorking } from "/scripts/utils.js"

const Companies = Constants.Companies
const workType = Constants.WorkTypes.Company

/**
 * Works for the most profitable company we qualify for.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    let companies = []
    for (const key in Companies) {
        const company = Companies[key]
        companies.push({
            favor: ns.getCompanyFavor(company.name),
            name: company.name,
            position: company.position,
            repReq: company.repReq,
            salaryMult: company.salaryMult,
        })
    }

    /**
     * Sort companies by least favor so we work at the most needed ones first
     * but first sort by least rep requirements and most salary in case of ties
     */
    companies = companies.sort((a, b) => a.repReq - b.repReq)
    companies = companies.sort((a, b) => b.salaryMult - a.salaryMult)
    companies = companies.sort((a, b) => a.favor - b.favor)

    let companyToWorkFor = ""
    for (const company of companies) {
        if (
            ns.getCompanyRep(company.name) < company.repReq &&
            applyToCompany(ns, company.name, company.position) &&
            ns.workForCompany(company.name)
        ) {
            companyToWorkFor = company.name
            break
        }
    }

    // If we don't have any companies we need to work for, let's go for
    // achieving the CFO position of the company we have the most favor with
    if (companyToWorkFor === "") {
        // Check the company with the highest favor that has a business track
        const company = companies
            .filter((c) => c.position === Constants.Positions.Business)
            .sort((a, b) => b.favor - a.favor)[0]

        if (
            ns.getCompanyRep(company.name) < 800e3 &&
            applyToCompany(ns, company.name, Constants.Positions.Business)
        ) {
            companyToWorkFor = company.name
        }
    }

    if (companyToWorkFor != "") {
        /**
         * Sleep until we gain 4000 rep (each position upgrade is divisible by
         * 4000) taking the early cancel penalty into account, or if we start
         * working on something else
         */
        while (
            ns.getPlayer().workRepGained < 4000 * 2 &&
            isWorking(ns, workType)
        ) {
            // eslint-disable-next-line no-await-in-loop
            await ns.sleep(1000)
        }

        ns.exit()
    }

    // If we're working for a company when we don't need to, let's stop so
    // that we can do other work.
    if (ns.getPlayer().workType === workType) {
        ns.stopAction()
    }
}

/**
 * Attempts to apply to the company and returns whether we were successful.
 *
 * @param ns
 * @param companyName
 * @param companyPosition
 * @returns True if we successfully applied to the company.
 */
function applyToCompany(
    ns: NS,
    companyName: string,
    companyPosition: IPosition
): boolean {
    // To avoid any race conditions, we'll make sure we've stopped work and
    // collected our rep before continuing on.
    if (ns.getPlayer().workType === workType) {
        ns.stopAction()
    }

    /**
     * We're going to start off with applying to a job that's always available
     * to avoid any potential false negatives when we apply for a job we
     * already have but don't qualify for a promotion.
     */
    ns.applyToCompany(
        Constants.Companies.FoodNStuff.name,
        Constants.Positions.PartTime.name
    )

    /**
     * If we don't have enough rep for the position we want there's
     * always software development.
     *
     * Note that we don't want to always default to Software Dev for all
     * requirements. If we don't meet the required combat stats, then we want
     * to skip this so we can commit crime to raise those stats. When we've
     * gained enough stats from crime, this will automatically pick up the
     * position we want since we'll have enough rep.
     */
    if (ns.getCompanyRep(companyName) < companyPosition.repMin) {
        return ns.applyToCompany(companyName, Constants.Positions.Software.name)
    }

    return ns.applyToCompany(companyName, companyPosition.name)
}
