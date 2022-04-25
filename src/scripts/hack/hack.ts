import { NS } from "@ns"

export async function main(ns: NS): Promise<void> {
    for (;;) {
        const host = ns.read("host.txt")

        if (host === "share") {
            await ns.share()
        } else {
            await ns.hack(host)
        }
    }
}
