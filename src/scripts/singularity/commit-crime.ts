import { NS } from '@ns';
import * as Constants from '/classes/constants.js';

/**
 * Commits crimes, sorted by profitability.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
  // Minimum number of kills needed to join all factions
  const killMinimum = 30;
  const lethalCrimes = ['assassination', 'homicide'];

  // Sort crimes by profitability
  const crimes = [];
  for (const key in Constants.Crimes) {
    const crime = Constants.Crimes[key];
    const crimeChance = ns.getCrimeChance(crime.name);

    crimes.push({
      name: crime.name,
      time: crime.time,
      chance: crimeChance,
      profitability: crime.money / crime.time / crimeChance,
    });
  }

  for (const crime of crimes) {
    // Lethal crimes are a special case and we want to max those out first
    const numKills = ns.getPlayer().numPeopleKilled;
    const shouldCommitLethalCrime =
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
