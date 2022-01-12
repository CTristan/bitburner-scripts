import { NS } from "@ns";
import * as Constants from "/classes/constants.js";

/**
 * Checks which stat is the lowest and commits the relevant crime for the
 * most optimal gain.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const player = ns.getPlayer();

    let stats = [];
    for (const key in Constants.Stats) {
        const stat = Constants.Stats[key];
        let level = 0;

        // Search the properties in player to find our stat
        Object.entries(player).forEach(([key, value]) => {
            if (key === stat) {
                level = value;
            }
        });

        stats.push({ level: level, name: stat });
    }

    // Sort by lowest stat
    stats = stats.sort((a, b) => a.level - b.level);

    // Get the stat once we've sorted our list
    const stat = stats[0].name;

    // Get the crimes that raise this stat
    let crimes = [];
    for (const key in Constants.Crimes) {
        const crime = Constants.Crimes[key];

        let crimeStatGain = 0;
        switch (stat) {
            case Constants.Stats.Agility:
                crimeStatGain = crime.agiExp;
                break;
            case Constants.Stats.Charisma:
                crimeStatGain = crime.chaExp;
                break;
            case Constants.Stats.Defense:
                crimeStatGain = crime.defExp;
                break;
            case Constants.Stats.Dexterity:
                crimeStatGain = crime.dexExp;
                break;
            case Constants.Stats.Strength:
                crimeStatGain = crime.strExp;
                break;
            default:
                break;
        }

        if (crimeStatGain > 0) {
            const crimeChance = ns.getCrimeChance(crime.name);

            crimes.push({
                name: crime.name,
                profitability: crime.money / crime.time / crimeChance,
                statGain: crimeStatGain / crimeChance,
                time: crime.time,
            });
        }
    }

    // Sort crimes by profitability first then by stat gain
    // In case of stat gain ties we want to choose the most profitable
    crimes = crimes.sort((a, b) => b.profitability - a.profitability);
    crimes = crimes.sort((a, b) => b.statGain - a.statGain);

    ns.commitCrime(crimes[0].name);
    await ns.sleep(crimes[0].time);
}
