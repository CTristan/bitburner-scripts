import { NS } from "@ns";

/** @param {NS} ns **/
// eslint-disable-next-line require-await
export async function main(ns: NS): Promise<void> {
    const invites = ns.singularity.checkFactionInvitations();
    for (let i = 0; i < invites.length; i++) {
        ns.singularity.joinFaction(invites[i]);
    }
}
