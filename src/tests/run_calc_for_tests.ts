
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

import { replacements } from "../preload/moduleReplacements";
import { fullReplacement } from "../../apply-replacements/applyReplacement";

document.body.dataset.loadData = JSON.stringify({ seed: "c29cb3444b1c435c8e4422a19ebf56f5" });
document.body.innerHTML = `
  <div class="dcg-sliding-interior">
    <div id="dcg-header-container"></div>
    <div id="graph-container"></div>
  </div>

  <div id="mygraphs-container"></div>
  <div id="dcg-modal-container"></div>
  <div class="dcg-loading-div-container"></div>
`

// https://stackoverflow.com/a/53449595/7481517
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

HTMLCanvasElement.prototype.getContext = () => ({
  scale: () => {}
} as any)
HTMLCanvasElement.prototype.toDataURL = () => ""
HTMLMediaElement.prototype.play = async () => {
  await new Promise<void>((resolve) => resolve())
}
console.debug = () => {}

let codeCache: string | undefined;
function getCalcDesktopCode() {
  if (codeCache) return codeCache;

  const file = path.join(__dirname, "../../node_modules/.cache/desmos/calculator_desktop.js");
  const calculatorDesktopRaw = fs.readFileSync(file, { encoding: "utf-8" });

  const repl = fullReplacement(calculatorDesktopRaw, replacements);
  codeCache = repl.newCode
  
  describe("Replacements are good", () => {
    test("No replacement errors", () => {
      expect(repl.blockFailures).toStrictEqual([]);
      expect(repl.otherErrors).toStrictEqual([]);
    })
  
    test("Replacements makes the code longer", () => {
      expect(repl.newCode.length).toBeGreaterThan(calculatorDesktopRaw.length + 1000)
    })
  })

  return codeCache
}

// eslint-disable-next-line no-eval
eval(getCalcDesktopCode())
