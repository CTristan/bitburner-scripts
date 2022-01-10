// Bitburner-specific rule exceptions
/* eslint-disable import/no-absolute-path */
import { NS } from '@ns'
import * as Constants from '/classes/constants.js'
import { isWorking } from '/scripts/utils.js'

const Factions = Constants.Factions
const workType = Constants.WorkTypes.Factions

/**
 * Work for a faction that we don't yet have enough rep with for all
 * of their augmentations.
 *
 * @param {NS} ns
 */
export async function main (ns: NS): Promise<void> {
  const ownedAugs = ns.getOwnedAugmentations(true)

  let factions = []
  for (const key in Factions) {
    const faction = Factions[key]

    // We want to get the required rep based off of the augmentations that we
    // don't own already
    const augs = ns
      .getAugmentationsFromFaction(faction)
      .filter((aug) => !ownedAugs.includes(aug))

    let highestRepReq = 0
    for (let j = 0; j < augs.length; j++) {
      const repReq = ns.getAugmentationRepReq(augs[j])
      highestRepReq = Math.max(highestRepReq, repReq)
    }

    factions.push({
      name: faction, favor: ns.getFactionFavor(faction), repReq: highestRepReq
    })
  }

  // Sort by least favor so we can improve our most needed factions first
  // But sort by lowest reputation requirement first in the case of ties
  factions = factions.sort((a, b) => a.repReq - b.repReq)
  factions = factions.sort((a, b) => a.favor - b.favor)

  for (const faction of factions) {
    // If we don't have any faction rep, that means we aren't a member yet
    if (ns.getFactionRep(faction.name) > 0 &&
      ns.getFactionRep(faction.name) < faction.repReq) {
      do {
        // Keep working until we've either hit our desired rep or
        // started other work.
        await workForFaction(ns, faction.name, faction.repReq)
      } while (ns.getFactionRep(faction.name) < faction.repReq &&
        isWorking(ns, workType))

      // We're done working for this faction now
      if (isWorking(ns, workType)) {
        ns.stopAction()
      }

      ns.exit()
    }
  }

  // If we're still working on a faction, we can stop now
  if (isWorking(ns, workType)) {
    ns.stopAction()
  }
}

/**
 * Work for a faction. Priority is FieldWork -> SecurityWork -> Hacking.
 * This is so that non-Hacking stats can be leveled for infiltration.
 *
 * @param {NS} ns
 */
async function workForFaction (
  ns: NS,
  faction: string,
  repReq: number
): Promise<void> {
  let rep = ns.getFactionRep(faction)

  // First try donating money to increase rep the fastest
  rep = donateToFaction(ns, faction, repReq)

  if (rep < repReq) {
    const focus = ns.isFocused()

    if (
      !ns.workForFaction(faction, 'Hacking', focus) &&
            !ns.workForFaction(faction, 'Field Work', focus)
    ) {
      ns.workForFaction(faction, 'Security Work', focus)
    }

    // Sleep until we gain 1000 rep or start working on something else
    while (ns.getPlayer().workRepGained < 1000 && isWorking(ns, workType)) {
      await ns.sleep(1000)
    }
  }
}

/**
 * @param {NS} ns
 */
function donateToFaction (ns: NS, faction: string, repReq: number): number {
  const favor = ns.getFactionFavor(faction)
  let rep = ns.getFactionRep(faction)

  if (favor >= 150) {
    const repDifference = repReq - rep
    const repMultiplier = favor / 100

    /**
         * Formula for reputation gain:
         * reputation = donationAmount * reputationMultiplier / 10e6
         *
         * Formula for donation amount:
         * donationAmount = reputation * 10e6 / reputationMultiplier
         */
    const donationAmount = Math.ceil((repDifference * 10e6) / repMultiplier)
    ns.donateToFaction(faction, donationAmount)

    rep = ns.getFactionRep(faction)
  }

  return rep
}
