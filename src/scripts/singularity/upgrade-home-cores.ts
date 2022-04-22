import { NS } from '@ns';

/**
 * Upgrades the number of cores on the home server.
 *
 * @param {NS} ns
 */
// eslint-disable-next-line require-await
export async function main(ns: NS): Promise<void> {
  ns.singularity.upgradeHomeCores();
}
