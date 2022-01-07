import { NS } from "@ns"
import { getConstants } from "/scripts/utils.js"

/**
 * Commits crimes, sorted by profitability.
 * Only activates when not busy with something else.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    // Minimum number of kills needed to join all factions
    const killMinimum = 30

    const crimes = getConstants().Crimes
    const lethalCrimes = ["assassination", "homicide"]

    for (let i = 0; i < crimes.length; i++) {
        const crime = crimes[i]
        const crimeChance = ns.getCrimeChance(crime.name)

        // Lethal crimes are a special case and we want to max
        // those out first
        const numKills = ns.getPlayer().numPeopleKilled
        const shouldCommitLethalCrime =
            numKills > killMinimum && lethalCrimes.indexOf(crime.name) > -1

        if (
            crimeChance < 1 &&
            (crimeChance >= 0.5 || shouldCommitLethalCrime)
        ) {
            ns.commitCrime(crime.name)
            await ns.sleep(crime.time * 1000)
            return
        }
    }
}
