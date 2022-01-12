import { NS } from "@ns";
import * as Constants from "/classes/constants.js";

/**
 * Commits crimes, sorted by profitability.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    // Minimum number of kills needed to join all factions
    const killMinimum = 30,
        // Crimes to get those kills
        lethalCrimes = ["assassination", "homicide"],
        crimes = [];

    // Sort crimes by profitability
    for (const key in Constants.Crimes) {
        const crime = Constants.Crimes[key],
            crimeChance = ns.getCrimeChance(crime.name);

        crimes.push({
            chance: crimeChance,
            name: crime.name,
            profitability: crime.money / crime.time / crimeChance,
            time: crime.time,
        });
    }

    for (const crime of crimes) {
        // Lethal crimes are a special case and we want to max those out first
        const numKills = ns.getPlayer().numPeopleKilled,
            shouldCommitLethalCrime =
                numKills < killMinimum && lethalCrimes.indexOf(crime.name) > -1;

        if (
            (crime.chance < 1 && crime.chance >= 0.5) ||
            shouldCommitLethalCrime
        ) {
            ns.commitCrime(crime.name);
            await ns.sleep(crime.time * 1000);
        }
    }
}
