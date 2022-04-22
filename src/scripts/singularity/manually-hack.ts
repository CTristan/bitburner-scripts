import { NS } from "@ns";
import { connectTo } from "/scripts/utils.js";

/**
 * Just a script that calls ns.manualHack() to be used by forceRunScript.
 * @param ns
 */
export async function main(ns: NS): Promise<number> {
    const hostname = ns.args[0].toString();

    connectTo(ns, hostname);
    const money = await ns.singularity.manualHack();
    return money;
}
