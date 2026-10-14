/******************************************************************************
 * FILE: src/tasks.ts
 * PURPOSE: Project maintanence task automation.
 * DATE: 2026-09-17
 * AUTHOR: jaen
 */

/**
 * Implements the `build` command line functionality.
 * @param args request values provided to the `build` command
 *               `media` operates on project media (see /Media/Media.json)
 *                         `links` generates direct media links to Github based on 
 *                                 actual files found under the /Media/ directory.
 * @returns {void}
 */
async function build(...args: string[]): Promise<void> {
  const RAWROOT = "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/";
  const FINDROOT = "Media/";
  const OUTFILE = `local/Media-${Temporal.Now.plainDateISO()}.json`;

  const [domain, cmdArg] = args;

  switch (domain?.toLocaleLowerCase()) {
    // Build the list of files under the Media/ directory.
    case "media": {
      if (cmdArg?.toLocaleLowerCase() === "links") {
        const cmd = new Deno.Command("find", {
          args: [
            FINDROOT,
            "-type", 
            "f", 
            "-exec",
            "echo", 
            `${RAWROOT}'{}'`,
            "'\;'",
          ],
        });
        const { code, stdout, stderr } = await cmd.output();
        const td = new TextDecoder();
        console.assert(code === 0, `find failed: ${code} ${td.decode(stderr)}`);
        if (code === 0) {
          const output = td.decode(stdout);
          const links = output.split("\n")
            .filter((l) => l?.length > 0)
            .map((ll) => encodeURI(ll));
          await Deno.writeTextFile(OUTFILE, JSON.stringify(links, null, 2));
          console.log(`Done: ${links.length} links generated in "${OUTFILE}"`);
        }
      }
      break;
    }
    default: {
      console.error("[build]", "Unhandled command arguments:", `domain:"${domain}"`, `cmdArg:"${cmdArg}"`);
      return;
    }
  }
}

if (import.meta.main) {
  const [cmd, args] = [Deno.args[0], Deno.args.slice(1)];
  let exit = 0;

  if (cmd && cmd.length && cmd.length > 0) {
    switch (cmd.toLocaleLowerCase()) {
      case "build": {
        if (args && args.length && args.length > 1) {
          build(...args);
        } else {
          console.error("[tasks.ts]", "Build requires 2 parameters.");
          exit = 1;
        }
        break;
      }
      default: {
        console.error(
          "[tasks.ts]", 
          "Unhandled command input:", 
          `cmd:"${cmd}"`, `args:${args?.map((a) => `"${a}"`)?.join(", ")}`
        );
        exit = 2;
      }
    }
  }

  if (exit !== 0)
    Deno.exit(exit);
}