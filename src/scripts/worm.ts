import { NS } from '@ns';
import { hackServer, scanForAllServers } from '/scripts/utils.js';

/**
 * Scans all hackable servers, roots them and installs hacking scripts on them.
 * @param {NS} ns
 **/
export async function main(ns: NS): Promise<void> {
  // First arg is whether or not to force a script update on all servers
  const forceScriptUpdate = ns.args.length > 0 ? ns.args[0] : false;
  disableLogs(ns);

  // The script name to infect every server with.
  const script = '/scripts/loop.js';
  const script2gb = '/scripts/2gb-loop.js';

  // Infect all servers, including purchased servers.
  const servers = scanForAllServers(ns, true).filter(
    (server) => server != 'home',
  );

  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];

    if (forceScriptUpdate) {
      ns.killall(server);
    }

    ns.print('About to hack ' + server);
    await hackServer(ns, server, script, script2gb);
  }
}

/** @param {NS} ns */
function disableLogs(ns: NS): void {
  ns.disableLog('getHackingLevel');
  ns.disableLog('getServerNumPortsRequired');
  ns.disableLog('getServerRequiredHackingLevel');
  ns.disableLog('scan');
}
