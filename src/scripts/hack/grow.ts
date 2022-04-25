import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    for (; ;) {
        const host = ns.read("host.txt");
        await ns.grow(host);
    }
}