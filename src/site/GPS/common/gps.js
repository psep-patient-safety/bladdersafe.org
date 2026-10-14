
// MODULE VARIABLES
/**
 * @typedef FormDataSuitcase
 * @property {FormData} formData
 * 
 * @typedef ModuleData
 * @property {boolean} debug Enable debug output in console (or not)
 * @property {boolean} anyInputChangedSinceSubmit Has an input changed since last submit?
 * @property {HTMLDivElement | null} feedbackElement
 * @property {HTMLParagraphElement | null} feedbackTextElement
 * @property {number} feedbackTimeout
 * @property {FormDataSuitcase} formSuitcase
 * @property {string[]} formEntryKeys
 * @property {HTMLFormElement | null} htmlForm
 * @property {string[]} qGuidance
 * @property {(number | null)[]} qResponses
 * @property {string[]} responseClasses
 * @property {string[]} responseContents
 * @property {number} submitTextStep
 * @property {string[]} submitText
 */
const /**@type {ModuleData}*/ MODULE = {
  debug: true,

  anyInputChangedSinceSubmit: false,
  feedbackElement: null,
  feedbackTextElement: null,
  feedbackTimeout: -1,
  formSuitcase: { formData: new FormData(), },
  formEntryKeys: [],
  htmlForm: null,
  // processSetup: false,
  qGuidance: ["y", "y", "y", "y", "y", "y", "y", "y", "y", "n", "n", "n", "n", ],
  qResponses: [],
  responseClasses: ["gps-response-mismatch", "gps-response-match"],
  responseContents: ["&#x2718;", "&#x2714;"],
  submitTextStep: -1,
  submitText: [
    "Submit for Feedback",
    "Feedback Provided",
  ],
}


// MODULE FUNCTIONS
/**
 * Submit text to console.debug if debugging enabled in module data
 * @param  {...string} args 
 */
function debug(...args) {
  if (MODULE.debug === true) {
    console.debug(args.join(""));
  }
}

function loadModuleData() {
  MODULE.feedbackElement = document.querySelector("#gps-response-feedback");
  if (MODULE.feedbackElement === null)
    throw new Error("Script init failed: no feedback element found.");

  MODULE.feedbackElement.addEventListener("click", (_event) => {
    if (MODULE.feedbackElement !== null) {
      MODULE.feedbackElement.dataset.active = "false";
      if (MODULE.feedbackTimeout !== -1) {
        clearTimeout(MODULE.feedbackTimeout);
        MODULE.feedbackTimeout = -1;
      }
    }
  });

  MODULE.feedbackTextElement = document.querySelector("p#gps-feedback");
  if (MODULE.feedbackTextElement === null)
    throw new Error("Script init failed: no feedback element paragraph found.");

  MODULE.htmlForm = document.querySelector("form#cauti-gps");
  if (MODULE.htmlForm === null)
    throw new Error("Script init failed: no form found.");
  
  const /**@type {(HTMLElement)[]}*/ formElements = Array.from(
    MODULE.htmlForm.querySelectorAll("[data-qkey].gps-question")
  );
  MODULE.formEntryKeys.push(... 
    formElements.map((div) => `${div.dataset.qkey}-response`));
  
  MODULE.htmlForm.addEventListener("submit", (event) => {
    event.preventDefault();

    MODULE.formSuitcase.formData = new FormData(MODULE.htmlForm ?? undefined);

    const responses = MODULE.formEntryKeys.map(
      (fek) => MODULE.formSuitcase.formData.get(fek)
    );

    if (responses.some((v) => v === null)) {
      provideFeedback("Unable to process incomplete form. Please respond to all questions.");
      return;
    }

    // Iterate over provided responses and compare to guidance responses.
    // The qResponses value indicates if the client should display 
    //   "match" or "no match".
    responses.forEach((r, ridx) => MODULE.qResponses[ridx] = 
      r === null
      ? null
      : MODULE.qGuidance[ridx] === r 
        ? 1 
        : 0);

    hideAllGuidance();
    updateQuestionFlagCells();
    const /**@type {NodeListOf<HTMLButtonElement>}*/ buttons = 
      document.querySelectorAll("button.gps-response");
    buttons.forEach((b) => b.disabled = false);

    cycleStateText();
  });
}

/**
 * Give feedback to the user (e.g., unable to process incomplete form)
 * @param {string} feedback Feedback to display
 * @param {number | null} duration Number of seconds to display; null means do not auto-dismiss.
 */
function provideFeedback(feedback, duration = 8) {
  if (typeof duration === "number" && duration > 15)
    duration = 15;
  if (!feedback || feedback.length < 1) {
    debug(feedback ?? "Unable to display feedback. Feedback also empty.");
    throw new Error("Unable to display feedback: none provided.");
  }
  if (MODULE.feedbackTextElement === null || MODULE.feedbackElement === null) {
    debug(feedback);
    throw new Error("Unable to display feedback: no output elements found.")
  }
  MODULE.feedbackTextElement.innerText = feedback;
  if (duration !== null) {
    MODULE.feedbackTimeout = setTimeout(() => {
      if (MODULE.feedbackElement) 
        MODULE.feedbackElement.dataset.active = "false";
    }, duration * 1000);
  }
  MODULE.feedbackElement.dataset.active = "true";
}

/**
 * Safe access to the appropriate class and contents.
 * @param {number} index into NEW_CELL_CLASSES/NEW_CELL_CONTENTS
 * @returns {[string, string]}
 */
function getResponseValues(index) {
  const /**@type {[string, string]}*/ output = ["", ""];
  const responseMatchFlagIndex = MODULE.qResponses[index];
  if (responseMatchFlagIndex === undefined || responseMatchFlagIndex === null) {
    throw new Error(`No response match flag index: ${index}`);
  }
  const wcls = MODULE.responseClasses[responseMatchFlagIndex];
  if (wcls === undefined)
    throw new Error(`No classes for index: ${index}`);
  
  output[0] = wcls;
  output[1] = MODULE.responseContents[responseMatchFlagIndex] || "??";
  return output;
}

function updateQuestionFlagCells() {
  const responseElements = document.querySelectorAll(".gps-response");
  responseElements.forEach((re, reidx) => {
    const [cls, content] = getResponseValues(reidx);
    re.className = `gps-response ${cls}`;
    re.innerHTML = content;
  });
}

function cycleStateText() {
  const submitTextPara = /**@type {HTMLElement}*/(
    document.querySelector("#submit-state-feedback")
  );
  if (!submitTextPara)
    throw new Error("Submit state paragraph element not found.");
  
  MODULE.submitTextStep = MODULE.submitTextStep === -1 
    ? 0 
    : MODULE.submitTextStep === 1 
      ? 0 
      : 1;
  submitTextPara.innerText = MODULE.submitText[MODULE.submitTextStep] 
    ?? "DAVE'S NOT HERE"; // "this should never be returned"
}

function hideAllGuidance() {
  const spans = /**@type {NodeListOf<HTMLSpanElement>}*/(
    document.querySelectorAll(".gps-guidance > span[data-active]")
  );
  spans.forEach((s) => s.dataset.active = "false");
  const gdivs = /**@type {NodeListOf<HTMLDivElement>}*/(
    document.querySelectorAll(".gps-guidance")
  );
  gdivs.forEach((g) => g.dataset.active = "false");
}

document.addEventListener("DOMContentLoaded", () => {
  loadModuleData();

  // Set up all document handlers
  
  const gpsWrapper = document.querySelector(".gps-wrapper");
  if (!gpsWrapper)
    throw new Error("Load failed: no GPS wrapper element found.");
  cycleStateText(); // initialize top banner state text

  // Handle grid "button" clicks (some are actually spans)
  gpsWrapper.addEventListener("click", (event) => {
    const target = /**@type {HTMLElement | null}*/ (event.target);
    if (target === null) return;
    
    // SPANS
    if (target.tagName === "SPAN" 
        && (target.classList.contains("radio-group")
            || target.classList.contains("radio-group-box")))
    {
      const input = target.querySelector("input");
      input?.click();
      return;
    }

    const q = /**@type {HTMLElement}*/(target.closest(".gps-question"));
    if (q === null) return;
    const qkey = q.dataset.qkey;
    if (!qkey)
      throw new Error(`Cannot find closest question to button ${target.id}`);

    // INPUTS
    if (target.tagName === "INPUT") {
      const val = MODULE.formSuitcase.formData.get(
        /**@type {HTMLInputElement}*/(target).name);
      if (val !== null && val !== /**@type {HTMLInputElement}*/(target).value) {
        MODULE.anyInputChangedSinceSubmit = true;
        const resultButton = /**@type {HTMLButtonElement | null}*/(
          q.querySelector(`#${qkey}-result`)
        );
        if (resultButton !== null && resultButton.innerText !== "--") {
          resultButton.innerText = "--";
          // resultButton.classList.remove("gps-response-mismatch");
          // resultButton.classList.remove("gps-response-match");
          resultButton.classList.remove(...MODULE.responseClasses);
          resultButton.disabled = true;

          const activeSpan = /**@type {HTMLElement | null}*/(
            q.querySelector(".gps-guidance > span[data-active]")
          );
          const gDiv = /**@type {HTMLElement | null}*/(
            q.querySelector(".gps-guidance")
          );
          
          cycleStateText();
        }
      }
      return;
    }

    // BUTTONS
    if (target.tagName === "BUTTON" && target.classList.contains("gps-response")) {
      const qindex = parseInt(q.dataset.qindex ?? "-1");
      const gcSelector = `[data-qkey="${qkey}"] > .gps-guidance`;
      const guidanceContainer = /**@type {HTMLDivElement | null}*/(
        document.querySelector(gcSelector)
      );
      if (guidanceContainer) {
        const gcEnabled = guidanceContainer.dataset.active === "true";
        if (gcEnabled === true) {
          guidanceContainer.dataset.active = "false";
          return;
        }

        if (MODULE.qResponses[qindex] !== undefined) {
          const responseTag = MODULE.qResponses[qindex] === 1 
            ? MODULE.qGuidance[qindex] === "y" ? "yes" : "no"
            : MODULE.qGuidance[qindex] === "y" ? "no" : "yes";
          const spanSelector = `[data-key="${qkey}-guide-${responseTag}"]`;
          const /**@type {HTMLSpanElement | null}*/ span = 
            guidanceContainer.querySelector(spanSelector);
          const buttonSelector = `#${qkey}-result`;
          const /**@type {HTMLButtonElement | null}*/ button = 
            document.querySelector(buttonSelector);
          if (span && button) {
            span.dataset.active = "true";
            guidanceContainer.dataset.active = "true";
            button.disabled = false;
          } else {
            throw new Error(
              `span or button kapot "${spanSelector}" "${buttonSelector}"`
            );
          }
        } else {
          debug(`Element not found: "${gcSelector}"`);
        }
      }
    }
  });

  // Handle test (guideline concordant) button: populate with GC answers
  const /**@type {HTMLButtonElement | null}*/ testGC = document
    .querySelector("#test-form-guideline-concordant");
  if (!testGC)
    throw new Error("No Test (GC) button element found.");
  testGC.addEventListener("click", (_event) => {
    const elements = /**@type {NodeListOf<HTMLElement>}*/(
      document.querySelectorAll(".gps-question")
    );
    elements.forEach((qdiv) => {
      const q = parseInt(qdiv.dataset.qindex ?? "");
      if (!isNaN(q)) {
        const inputSelector = 
          `input#${qdiv.dataset.qkey}-${q < 9 ? "yes" : "no"}`;
        const c = /**@type {HTMLInputElement}*/(
          qdiv.querySelector(inputSelector)
        );
        c?.click();
        if (!c) throw new Error(`Not found: ${inputSelector}`);
      }
    });
  });

  // Handle "50/50" button click: Randomly answer Yes or No to all questions
  const /**@type {HTMLButtonElement | null}*/ testRand = 
    document.querySelector("#test-form-random");
  if (!testRand)
    throw new Error("No Test (random) button element found.");
  testRand.addEventListener("click", (_event) => {
    const /**@type {NodeListOf<HTMLElement>}*/ elements = 
      document.querySelectorAll(".gps-question");
    elements.forEach((qdiv) => {
      const q = Math.random() < 0.5 ? "yes" : "no";
      const inputSelector = `input#${qdiv.dataset.qkey}-${q}`;
      const c = /**@type {HTMLInputElement}*/(
        qdiv.querySelector(inputSelector)
      );
      c?.click();
      if (!c) throw new Error(`Not found: ${inputSelector}`);
    });
  });
});
