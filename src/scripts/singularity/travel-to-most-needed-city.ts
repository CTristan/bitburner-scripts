import { NS } from "@ns";
import * as Constants from "/classes/constants.js";

const Cities = Constants.Cities;

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
    const city = { name: "", favor: 0 };
    for (const key in Cities) {
        const cityName = Cities[key];
        const favor = ns.getFactionFavor(cityName);
        if (favor > city.favor) {
            city.name = cityName;
            city.favor = ns.getFactionFavor(cityName);
        }
    }

    // Travel to that city and join their faction
    await joinCity(ns, city.name);

    // Join any allied city's factions
    switch (city.name) {
        case Cities.Aevum:
            await joinCity(ns, Cities.Sector12);
            break;
        case Cities.Chongqing:
            await joinCity(ns, Cities.Ishima);
            await joinCity(ns, Cities.NewTokyo);
            break;
        case Cities.Ishima:
            await joinCity(ns, Cities.NewTokyo);
            await joinCity(ns, Cities.Chongqing);
            break;
        case Cities.NewTokyo:
            await joinCity(ns, Cities.Ishima);
            await joinCity(ns, Cities.Chongqing);
            break;
        case Cities.Sector12:
            await joinCity(ns, Cities.Aevum);
            break;
        default:
            break;
    }

    // Go to Chongqing to join the other factions there
    await travelToCity(ns, Cities.Chongqing);
}

async function joinCity(ns: NS, city: string): Promise<void> {
    await travelToCity(ns, city);

    while (ns.getFactionRep(city) <= 0) {
        await ns.sleep(1000);
    }
}

async function travelToCity(ns: NS, city: string): Promise<void> {
    if (ns.getPlayer().city == city) return;

    while (!ns.travelToCity(city)) {
        await ns.sleep(1000);
    }
}
