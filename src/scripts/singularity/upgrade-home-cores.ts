import { NS } from '@ns';

/**
 * Upgrades the number of cores on the home server.
 *
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
  ns.upgradeHomeCores();
}
