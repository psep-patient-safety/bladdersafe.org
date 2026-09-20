// bladdersafe.org{web.archive.org}: extract presentations from educational tools tab of weebly resources page
// e.g., https://web.archive.org/web/20260218210859/https://www.bladdersafe.org/resources.html
(function() {
  function downloadTextFile(
    filename,
    text,
    type = "txt",
    charset = "utf-8",
  ) {
    const mimeTypes = new Map([
      ["json", "application/json"],
      ["csv", "text/csv"],
      ["txt", "text/plain"],
    ]);
    
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:${mimeTypes.get(type) ?? "text/plain"};charset=${charset},` + encodeURIComponent(text),
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const OLD_URL_PREFIX = "https://www.bladdersafe.org/uploads/5/6/5/0/56503399/";
  const BLANK = "";
  const HTML_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentations</title>
</head>
<body>
  <div>
    <style>
      .card-wrapper {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: stretch;

        border: 1px solid black;
        border-radius: 25px;
        margin: 1em auto;
        padding: 1em;
      }
      .card {
        border: 1px dashed var(--tweak-line-block-line-color, blue);
        border-radius: 25px;
        margin: 1em auto;
        width: 27%;
        padding: 0.5em 1em;
        word-break: break-word;
        & .title {
          font-weight: bold;
        }
        & .presenter {
          font-style: italic;
        }
        & .format-list {
          padding-block-start: 2em;
        }
        & [data-item="pdf"]::before {
          content: '[PDF] ';
        }
        & [data-item="powerpoint"]::before {
          content: '[PPT/X] ';
        }
      }
      .sqs-block-code .sqs-block-content :first-child {
        margin-top: inherit;
      }
      .sqs-block-code .sqs-block-content :last-child {
        margin-bottom: inherit;
      }
    </style>
    <div class="card-wrapper">
{CARDS}
    </div>
  </div>
</body>
</html>`;
  const FILE_NAME_MAPPING = [
    ["2205_meddings_cauti_progress_toward_zero_june4_final.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/CAUTI%20Progress%20Toward%20Zero%206-4-2012%20Meddings.pdf"],
    ["2600_meddings_disruptinglifecycleofuc_june4_2012_final.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Disrupting%20Life%20Cycle%20of%20UC%206-4-2012%20Meddings.pdf"],
    ["bladder_scanning_0.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/2.%20Prevention%20Strategies/Bladder%20Scan%20ISC%20Algo%20Fakih.pdf"],
    ["sustainability.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Ensuring%20Sustainability%20for%20Quality%20Fakih%20Krein.pdf"],
    ["sustainability.pptx", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Ensuring%20Sustainability%20for%20Quality%20Fakih%20Krein.pptx"],
    ["controversies_in_cauti_prevention.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Controversies%20in%20CAUTI%20prevention%202010%20Fakih.pdf"],
    ["focusing_on_appropriate_catheter_insertion.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Focusing%20on%20Appropriate%20Catheter%20Insertion%20Manojlovich%20Krein.pdf"],
    ["syllabus_saint_mha_may_3_engaging_clinicians_4-24-12.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Engaging%20Clinicians%20Saint%204-24-2012.pdf"],
    ["syllabus_saint_mha_may_3_engaging_clinicians_4-24-12.pptx", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Engaging%20Clinicians%20Saint%204-24-2012.pptx"],
    ["section_t_nursing_appropriateurinary_catheter_use_and_management_0.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Appropriate%20Urinary%20Catheter%20Use%20and%20Management%20Fakih.pdf"],
    ["section_t_nursing_appropriateurinary_catheter_use_and_management_0.ppt", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Appropriate%20Urinary%20Catheter%20Use%20and%20Management%20Fakih.ppt"],
    ["meddings_cauti_june2010_wocntalk_june15_final_0.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Impl%20Strategies%20Reduce%20HA-CAUTI%20Meddings.pdf"],
    ["module_2_chain_of_trans.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Infection%20Prevention%20Program%20Study%20-%20Process%20-%20Chain%20of%20Cross%20Transmission%20-%20Rye%20Olmsted.pdf"],
    ["module_2_chain_of_trans.ppt", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Infection%20Prevention%20Program%20Study%20-%20Process%20-%20Chain%20of%20Cross%20Transmission%20-%20Rye%20Olmsted.ppt"],
    ["bridson_lassiter_cauti_training_052912.pdf", "https://raw.githubusercontent.com/psep-patient-safety/bladdersafe.org/refs/heads/main/Media/Resources/5.%20Educational%20Tools/1.%20Presentations/Outcome%20Data%20NHSN%20CAUTI%20Criteria%20On%20the%20Cusp%20Stop%20HAI.pdf"]
  ];
  function getURL(forFile) {
    let output = "";
    for (const fnm of FILE_NAME_MAPPING) {
      if (fnm[0] === forFile) {
        output = fnm[1] ?? "";
        break;
      }
    }
    return output;
  }
  
  const outputs = $$("table .paragraph").map((elem) => {
    const sectionItems = Array.from(elem.querySelectorAll("a"));
    const lines = elem.innerText.split("\n").map((l) => 
      l.replaceAll(/[\u200b|\u000b|\u00a0]/g, "") // no idea where these junk characters come from
       .replace(/^\s+/, "")
       .replace(/\s+$/g, ""));
    if (lines && lines.length && lines.length < 3)
      return null;
    const output = {
        title: lines[0],
        presenter: lines.slice(1, lines.length - 1).join(" | "),
        formats: lines[lines.length - 1],
        links: [],
      };
    sectionItems.forEach((si) => {
      output.links.push({
        text: si.innerText,
        href: si.href,
      });
    });
    return output;
  }).filter((it) => it !== null);
  // console.log(JSON.stringify(outputs, null, 2));
  const htmls = outputs.map((it) => {
    const listItems = it.links.map((linkItem) => 
      `<div data-list="format-list" data-item="${linkItem.text.toLocaleLowerCase()}"><a href="${
        getURL(linkItem.href.replace(OLD_URL_PREFIX, BLANK))
      }" target="_blank">${linkItem.text}</a></div>`);

    const presenters = it.presenter?.split(" | ");
    const presenterChunk = presenters.length === 1 
      ? `<div class="presenter">${presenters[0]}</div>`
      : presenters
          .map((p) => `<div class="presenter">${p}</div>`)
          .join("\n        ");
    return (
      `      <div class="card">
        <div class="title">${it.title}</div>
        ${presenterChunk}
        <div class="format-list">${listItems.join("")}</div>
      </div>`
    );
  });
  // console.log(htmls.join("\n"));
  const output = HTML_TEMPLATE.replace("{CARDS}", htmls.join("\n"));
  downloadTextFile("presentations.html", output, "text/html");
})();