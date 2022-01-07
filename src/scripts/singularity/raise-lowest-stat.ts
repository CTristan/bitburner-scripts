import { NS } from "@ns"

/**
 * Checks which stat is the lowest and takes the corresponding university or gym class.
 * Only activates if we're not busy with something else.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    if (!ns.isBusy()) {
        const gyms = [
            "Powerhouse Gym", // Sector-12
            "Millenium Fitness Gym", // Volhaven
        ]
        const universities = [
            "Rothman University", // Sector-12
            "ZB Institute of Technology", // Volhaven
        ]
        const player = ns.getPlayer()
        let stats = [
            { name: "Algorithms", level: player.hacking },
            { name: "strength", level: player.strength },
            { name: "defense", level: player.defense },
            { name: "dexterity", level: player.dexterity },
            { name: "agility", level: player.agility },
            { name: "Leadership", level: player.charisma },
        ]
        stats = stats.sort((a, b) => a.level - b.level)

        for (let i = 0; i < stats.length; i++) {
            const stat = stats[i]

            if (stat.name === "Algorithms" || stat.name === "Leadership") {
                for (let j = 0; j < universities.length; j++) {
                    const university = universities[j]

                    if (ns.universityCourse(university, stat.name)) {
                        await ns.sleep(60000)
                        return
                    }
                }
            } else {
                for (let j = 0; j < gyms.length; j++) {
                    const gym = gyms[j]

                    if (ns.gymWorkout(gym, stat.name)) {
                        await ns.sleep(60000)
                        return
                    }
                }
            }
        }
    }
}
