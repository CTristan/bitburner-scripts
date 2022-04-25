import { NS } from '@ns'

/**
 * Schedules batches to run against the server.
 * @param ns NS
 */
export async function main(ns: NS): Promise<void> {
    const host = ns.getHostname();

    // First need to prep the server so timings are accurate.
    // Security level needs to be minimum and money needs to be maximum.
    await weakenServerToMinimum(ns, host);
    await growServerToMaximum(ns, host);
    await weakenServerToMinimum(ns, host);
}

async function weakenServerToMinimum(ns: NS, host: string): Promise<void> {
    const minSecurity = ns.getServerMinSecurityLevel(host);
    while (ns.getServerSecurityLevel(host) > minSecurity) {
        await ns.weaken(host);
    }
}

async function growServerToMaximum(ns: NS, host: string): Promise<void> {
    const maxMoney = ns.getServerMaxMoney(host);
    while (ns.getServerMoneyAvailable(host) < maxMoney) {
        await ns.grow(host);
    }
}