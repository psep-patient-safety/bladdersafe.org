import * as path from "@std/path";

type GPSType = "CAUTI" | "CLABSI" | "MRSA" | "CDI";
const isGPSType = (input: string): input is GPSType => 
  ["CAUTI", "CLABSI", "MRSA", "CDI"].includes(input);

interface IOData {
  input: string;
  output: string;
}

interface GPSRecord {
  gpsType: GPSType;
  qindex: null | number;
  qnum: null | string;
  qtext: string;
  responseOptions: {
    response: string;
    answer: string;
  }[];
  guidanceResponse: {
    response: string;
  }
}

function questionsToFormHTML(records: GPSRecord[], type: GPSType): string {
  const timestamp = new Date().toISOString();
  const title = `${type} GPS`;
  const outputTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="timestamp" content="${timestamp}">
  <title>${title}</title>
</head>
<body>
  <main>
    <article>
      <h2>${title}</h2>
      <link rel="stylesheet" href="common/gps.css" crossorigin="anonymous">
      <div class="gps-wrapper">
        <div class="submit-state">
          <p id="submit-state-feedback">Loading...</p>
        </div>
        <div id="gps-response-feedback" class="gps-response-feedback" data-active="false">
          <p id="gps-feedback">Loading...</p>
        </div>
        <form id="cauti-gps">
          <div class="gps-questions">
            <div class="controls-d">
              <button type="button" id="test-form-guideline-concordant">GC</button>
              <button type="button" id="test-form-random">50/50</button>
              <button type="submit" id="process">Submit</button>
            </div>
{GPSQUESTIONS}
            <div class="controls">
              <button type="submit" id="process">Check Responses Against Guidance</button>
            </div>
          </div>
        </form>
      </div>
      <script src="common/gps.js" crossorigin="anonymous"></script>
    </article>
  </main>
</body>
</html>`;

  const outputChunks: string[] = [];
  for (const q of records) {
    if (q.qindex === null || q.qnum === null)
      continue;
    const qkey = `q${q.qnum.toLocaleLowerCase()}`;
    const [yesIndex, noIndex] = q.responseOptions[0]?.response.toLocaleLowerCase() === "yes" ? [0,1] : [1,0];
    let guideYes = q.responseOptions[yesIndex]?.answer;
    if (guideYes === undefined) guideYes = "[No guidance provided.]";
    let guideNo = q.responseOptions[noIndex]?.answer;
    if (guideNo === undefined) guideNo = "[No guidance provided.]";
    outputChunks.push(
`           <div class="gps-question" 
                  data-qkey="${qkey}" 
                  data-qindex="${q.qindex}" 
                  data-qnum="${q.qnum}" 
                  data-active="${q.qnum === "1"}">
              <div class="b-container">
                <button type="button" id="${qkey}-result" class="gps-response" disabled>--</button>
              </div>
              <div class="q-container">
                <p>
                  <span class="gps-question-number">Question ${q.qnum}.</span>&nbsp;<span class="gps-question-text">${q.qtext}</span>
                </p>
                <div class="gps-question-responses">
                  <span class="radio-group-box">
                    <span class="radio-group">
                      <input type="radio" name="${qkey}-response" id="${qkey}-yes" value="y" />
                      <label for="${qkey}-yes">Yes</label>
                    </span>
                  </span>
                  <span class="radio-group-box">
                    <span class="radio-group">
                      <input type="radio" name="${qkey}-response" id="${qkey}-no" value="n" />
                      <label for="${qkey}-no">No</label>
                    </span>
                  </span>
                </div>
              </div>
              <div class="gps-guidance" data-active="false">
                <span data-key="${qkey}-guide-yes">${guideYes}</span>
                <span data-key="${qkey}-guide-no">${guideNo}</span>
              </div>
            </div>`
    );
  }
  return outputTemplate.replace("{GPSQUESTIONS}", outputChunks.join("\n"));
}

if (import.meta.main) {
  const rel = (relativePath: string) => path.resolve(import.meta.dirname ?? ".", relativePath);
  const inputOutputMap: Map<GPSType, IOData> = new Map([
    ["CAUTI",{input: rel("../defs/cauti-gps.json"), output: rel("../cauti-gps-gen.html")}],
    ["CLABSI",{input: rel("../defs/clabsi-gps.json"), output: rel("../clabsi-gps-gen.html")}],
    ["MRSA",{input: rel("../defs/mrsa-gps.json"), output: rel("../mrsa-gps-gen.html")}],
    ["CDI",{input: rel("../defs/cdi-gps.json"), output: rel("../cdi-gps-gen.html")}],
  ]);

  const arg: string = (Deno.args[0] ?? "CAUTI").toLocaleUpperCase();

  if (["--HELP", "HELP", "?"].includes(arg)) {
    console.log(`Usage: ${import.meta.filename} [${Array.from(inputOutputMap.keys()).join("|")}]`);
    Deno.exit(0);
  }

  if (!isGPSType(arg)) {
    console.error(`Input not accepted: "${arg}". Byeeee!`);
    Deno.exit(1);
  }

  const {input, output} = inputOutputMap.get(arg) ?? { x: null, y: null};
  console.log(
    "<< %c%s%c\n>> %c%s%c",
    "font-weight: bold; color: blue;",
    input,
    "font-weight: revert; color: revert;",
    "font-weight: bold; color: green;",
    output,
    "font-weight: revert; color: revert;",
  );
  if (!input || !output)
    Deno.exit(2);

  try {
    const gpsTextDef = await Deno.readTextFile(input);
    const gpsDefs = JSON.parse(gpsTextDef);
    
    const outputHTML = questionsToFormHTML(gpsDefs, arg);
    await Deno.writeTextFile(output, outputHTML);
  } catch (error) {
    console.error(
      "<< %c%s%c >>", 
      "font-weight: bold; color: red;", 
      `${(error as Error).message}`, 
      "font-weight: revert; color: revert;"
    );
    Deno.exit(3);
  }
}