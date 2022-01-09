import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { isWorking } from "/scripts/utils.js"

const Crimes = Constants.Crimes
const workType = Constants.WorkTypes.Crime

/**
 * Commits crimes, sorted by profitability.
 * Only activates when not busy with something else.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    // Minimum number of kills needed to join all factions
    const killMinimum = 30

    const lethalCrimes = ["assassination", "homicide"]

    for (const key in Crimes) {
        const crime = Crimes[key]
        let crimeChance = ns.getCrimeChance(crime.name)

        // Lethal crimes are a special case and we want to max
        // those out first
        let numKills = ns.getPlayer().numPeopleKilled
        let shouldCommitLethalCrime =
            numKills < killMinimum && lethalCrimes.indexOf(crime.name) > -1

        while (
            (crimeChance < 1 && crimeChance >= 0.5) ||
            shouldCommitLethalCrime
        ) {
            ns.commitCrime(crime.name)
            await ns.sleep(crime.time * 1000)

            // If we're not still committing crimes, let's leave so we don't
            // accidentally interrupt something else
            if (!isWorking(ns, workType)) return

            // Refresh our crime statistics
            crimeChance = ns.getCrimeChance(crime.name)
            numKills = ns.getPlayer().numPeopleKilled
            shouldCommitLethalCrime =
                numKills > killMinimum && lethalCrimes.indexOf(crime.name) > -1
        }
    }
}
