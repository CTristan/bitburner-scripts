import { NS } from "@ns";
import * as Constants from "/classes/constants.js";

/**
 * Travels to the city with the least favor. Used after resets to make sure
 * all of the city augmentations will eventually be installed.
 *
 * If we travel to a city that is allied with another city, then we will
 * wait until we have joined the first city's faction before traveling to
 * the next city.
 *
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
    // Find the city with the least favor
    let city = "";
    let favor = Number.MAX_VALUE;

    for (const key in Constants.Cities) {
        const cityName = Constants.Cities[key];
        const cityFavor = ns.getFactionFavor(cityName);
        if (cityFavor < favor) {
            city = cityName;
            favor = cityFavor;
        }
    }

    // Travel to that city and join their faction
    await joinCity(ns, city);

    // Join all factions requiring a specific city
    await joinAllCityFactions(ns, city);
}

function hasFactionRep(ns: NS, faction: string): boolean {
    return ns.getFactionRep(faction) > 0;
}

function hasJoinedEnemyFaction(ns: NS, enemies: string[]): boolean {
    let isInEnemyFaction = false;

    ns.getPlayer().factions.forEach((faction) => {
        if (enemies.includes(faction)) {
            isInEnemyFaction = true;
        }
    });

    return isInEnemyFaction;
}

function isAlreadyInCity(ns: NS, city: string): boolean {
    return ns.getPlayer().city === city;
}

/**
 * Join all factions requiring a specific city that isn't an enemy of a faction
 * we've already joined
 *
 * @param ns
 * @param currentCity
 */
async function joinAllCityFactions(ns: NS, currentCity: string): Promise<void> {
    for (const key in Constants.Factions) {
        const faction = Constants.Factions[key];

        // If the faction doesn't require a specific city
        // then let's check the next one
        if (faction.cities.length === 0) {
            continue;
        }

        // If we've already joined an enemy faction then let's move on
        if (
            faction.enemies.length > 0 &&
            hasJoinedEnemyFaction(ns, faction.enemies)
        ) {
            continue;
        }

        // If we don't have faction rep yet
        // then we'll be in the city until we join the faction
        if (!hasFactionRep(ns, faction.name)) {
            // Need to check if we're already in the city before travelling
            if (!faction.cities.includes(currentCity)) {
                currentCity = await travelToCity(ns, faction.cities[0]);
            }

            while (!hasFactionRep(ns, faction.name)) {
                ns.print(`Waiting in ${currentCity} to join ${faction.name}.`);
                await ns.sleep(1000);
            }
        }
    }
}

async function joinCity(ns: NS, city: string): Promise<void> {
    await travelToCity(ns, city);

    while (ns.getFactionRep(city) <= 0) {
        ns.print(`Waiting to join ${city}.`);
        await ns.sleep(1000);
    }
}

async function travelToCity(ns: NS, city: string): Promise<string> {
    if (isAlreadyInCity(ns, city)) return city;

    while (!ns.travelToCity(city)) {
        await ns.sleep(1000);
    }

    return city;
}
