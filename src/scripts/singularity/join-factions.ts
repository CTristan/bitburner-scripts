import { NS } from '@ns';

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
  const invites = await ns.checkFactionInvitations();
  for (let i = 0; i < invites.length; i++) {
    ns.joinFaction(invites[i]);
  }
}
