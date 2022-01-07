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

    const crimes = [
        // Sorted by most profitable
        { name: "heist", time: 600 },
        { name: "assassination", time: 300 },
        { name: "kidnap", time: 120 },
        { name: "grand theft auto", time: 80 },
        { name: "homicide", time: 3 },
        { name: "traffick arms", time: 40 },
        { name: "bond forgery", time: 300 },
        { name: "deal drugs", time: 10 },
        { name: "mug", time: 4 },
        { name: "larceny", time: 90 },
        { name: "shoplift", time: 2 },
        { name: "rob store", time: 60 },
    ]
    const lethalCrimes = ["assassination", "homicide"]
    const constants = getConstants()
    const WorkTypes = constants.WorkTypes

    const player = ns.getPlayer()
    if (!ns.isBusy() || player.workType === WorkTypes.StudyClass) {
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
}
