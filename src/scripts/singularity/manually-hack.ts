import { NS } from "@ns";
import { connectTo } from "../utils";

/**
 * Just a script that calls ns.manualHack() to be used by forceRunScript.
 * @param ns
 */
export async function main(ns: NS): Promise<number> {
    const hostname = ns.args[0].toString();

    connectTo(ns, hostname);
    return await ns.manualHack();
}
