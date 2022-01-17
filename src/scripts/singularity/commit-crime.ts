import { NS } from "@ns"
import * as Constants from "/classes/constants.js"
import { forceRunScript } from "/scripts/utils"

/**
 * Commits crimes, sorted by profitability.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    // Minimum number of kills needed to join all factions
    const killMinimum = 30

    // Crimes to get those kills
    const lethalCrimes = ["assassination", "homicide"]

    // Sort crimes by profitability
    const crimes = []
    for (const key in Constants.Crimes) {
        const crime = Constants.Crimes[key]
        const crimeChance = ns.getCrimeChance(crime.name)

        crimes.push({
            chance: crimeChance,
            name: crime.name,
            profitability: crime.money / crime.time / crimeChance,
            time: crime.time,
        })
    }

    const crimeToCommit = {
        name: "",
        time: 0,
    }

    for (const crime of crimes) {
        // Lethal crimes are a special case and we want to max those out first
        const numKills = ns.getPlayer().numPeopleKilled
        const shouldCommitLethalCrime =
            numKills < killMinimum && lethalCrimes.indexOf(crime.name) > -1

        if (
            (crime.chance < 1 && crime.chance >= 0.5) ||
            shouldCommitLethalCrime
        ) {
            crimeToCommit.name = crime.name
            crimeToCommit.time = crime.time
            break
        }
    }

    if (crimeToCommit.name != "") {
        ns.commitCrime(crimeToCommit.name)
        await ns.sleep(crimeToCommit.time * 1000)
        ns.exit()
    }

    // If we don't have any crimes we want to commit for profitability,
    // then perform a crime based on stat gain.
    await forceRunScript(ns, "/scripts/singularity/raise-lowest-stat.js")
}
