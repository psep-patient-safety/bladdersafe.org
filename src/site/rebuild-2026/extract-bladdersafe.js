// bladdersafe.org{web.archive.org}: extract educational tools tab of weebly resources page
(function(ctx = document) {
  /**
   * Get the GUTS of the elements
   * @param {string} selector CSS selector to get items
   * @returns {Array<string>} Array of strings of `innerHTML` of selected elements
   */
  const GUTS = (selector, htmlNotText = false) => Array.from(
    document.querySelectorAll(selector)
  ).map((ce) => htmlNotText === true ? ce.innerHTML : ce.innerText);

  /**
   * Remove `n` number of items from the front of the array `a`.
   * @param {Array<unknown>} a Array of any objects
   * @param {number} n Number of items to `shift()` from `a`. Could in theory 
   *                    make n < 0 flip the function into a `pop()` - but why?
   * @returns {Array<unknown>} Array of items shifted from `a` or `[]` 
   *                            on error/empty array
   */
  function shiftN(a = [], n = -1) {
    const out = [];
    if (n > 0 && a && a.length >= n) {
      while (n-- > 0) {
        out.push(a.shift());
      }
    }
    return out;
  }

  // const gpsAnswerPairs = GUTS(".wsite-section-elements div[id]:not(:nth-of-type(1)) [data-item]");
  const gpsResponsePairs = GUTS(".wsite-section-elements div[id]:not(:nth-of-type(1)) .accordion__title .paragraph");
  const gpsAnswerPairs = GUTS(".wsite-section-elements div[id]:not(:nth-of-type(1)) .accordion__content .paragraph");
  if (!gpsResponsePairs || gpsResponsePairs.length < 1 || gpsResponsePairs.length % 2 !== 0)
    throw new Error(`No response pairs found. Byeee!`);

  if (!gpsAnswerPairs || gpsAnswerPairs.length !== gpsResponsePairs.length)
    throw new Error(`Response/Answer quads do not match. [A${gpsAnswerPairs?.length} | R${gpsResponsePairs.length}] Byeee!`);
  
  const gpsQuestions = GUTS(".wsite-section-elements > .paragraph");
  if (gpsQuestions.length > 0 && gpsQuestions.length !== gpsResponsePairs.length / 2)
    throw new Error(`Unpaired question elements returned. [Q${gpsQuestions.length} | R${gpsResponsePairs.length}] Byeee!`);

  const output = [];
  for (const q of gpsQuestions) {
    const qmatch = /^Question (\d+[A-D]?)/.exec(q);
    const stringyNum = qmatch ? qmatch[1] ?? -1 : -1;
    const [r1, r2] = shiftN(gpsResponsePairs, 2);
    const [a1, a2] = shiftN(gpsAnswerPairs, 2);
    // debugger;
    let i = 0;
    output.push({
      qindex: i++,
      qnum: stringyNum,
      qtext: q,
      responseOptions: [
        { response: r1, answer: a1 }, 
        { response: r2, answer: a2 }, 
      ]
    });
  }

  console.log(JSON.stringify(output));
  return output;
})();
