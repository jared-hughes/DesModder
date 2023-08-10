/* eslint-disable no-console */

/**
 * This is a script that takes the contents of raw.css and generates
 * overrides.less, replacing primary-based colors with var(--variable) and
 * keeping only those rules
 *
 * Usage:
 *   cd src/plugins/set-primary-color/
 *   node clean-css.mjs
 * Auto-reload:
 *   echo clean-css.mjs | entr node clean-css.mjs
 */
import * as fs from "fs";
import prettier from "prettier";

let css = fs.readFileSync("raw.css").toString();

const colorMapping = {
  // --- Primary color ---
  // secondary btn depressed, primary link depressed, show more rows in table, braille
  "#17396e": "--dsm-primary-dark-5-rgb", // 0.5
  // primary/secondary btn hovered, export image depressed, label orientation hovered, more
  "#2253a1": "--dsm-primary-dark-4-rgb", // 0.725
  // primary/secondary btn depressed, braille, more
  "#2457a8": "--dsm-primary-dark-3-rgb", // 0.765
  // primary (not dark bg) btn. Group with the next one
  "#2862bd": "--dsm-primary-dark-2-rgb", // 0.855
  // primary btn hovered, primary btn (not dark) depressed, export image, braille, more
  "#2964c2": "--dsm-primary-dark-1-rgb", // 0.877
  // pretty much everything (70); blue text and stuff
  "#2f72dc": "--dsm-primary-color-rgb", // 1
  // primary btn hovered
  "#347ff5": "--dsm-primary-light-1-rgb", // 1.11
  // primary btn border (on dark bg); for simplicity make same as light-1
  "#4480e0": "--dsm-primary-light-1-rgb", // nonlinear, avg 1.2
  // Green from Desmos. Will probably be patched
  "#127a3d": "--dsm-primary-color-rgb",
  // The names from here on are arbitrary
  // --- Grays ---
  "#fff": "--dsm-background-color-rgb",
  "#fcfcfc": "--dsm-top-bar-gradient-1",
  "#fafafa": "--dsm-white-outline",
  "#f9f9f9": "--dsm-circle-icon",
  "#f6f6f6": "--dsm-white-gradient1",
  "#f5f5f5": "--dsm-non-editable-cell",
  "#f0f0f0": "--dsm-white-gradient2",
  "#eee": "--dsm-gray-n",
  "#ededed": "--dsm-light-gray-hovered",
  "#ebebeb": "--dsm-toggle-switch",
  "#eaeaea": "--dsm-top-bar-gradient-2",
  "#e8e8e8": "--dsm-btn-flat-gray",
  "#e6e6e6": "--graph-link-container-actions-remove",
  "#e5e5e5": "--dsm-show-more-row",
  "#e2e2e2": "--dsm-component-checkbox-hovered",
  "#e0e0e0": "--dsm-light-gray-depressed",
  "#d8d8d8": "--dsm-expression-search-bar",
  "#d4d4d4": "--dsm-gray-n",
  "#ddd": "--dsm-gray-n",
  "#d3d3d3": "--dsm-options-menu",
  "#cfcfcf": "--dsm-gray-n",
  "#cecece": "--dsm-gray-n",
  "#ccc": "--dsm-gray-n",
  "#b3b3b3": "--dsm-icon-remove",
  "#bbb": "--dsm-gray-n",
  "#a9a9a9": "--dsm-gray-n",
  "#aaa": "--dsm-gray-n",
  "#999": "--dsm-gray-n",
  "#888": "--dsm-gray-n",
  "#777": "--dsm-metronome-bar",
  "#666": "--dsm-gray-n",
  "#5a5a5a": "--graph-link-container-actions",
  "#555": "--dsm-toggle-switch-hovered-toggled",
  "#444": "--dsm-gray-n",
  "#333": "--dsm-component-checkbox",
  "#2a2a2a": "--dsm-header",
  "#222": "--dsm-gray-n",
  "#000": "--dsm-foreground-color-rgb",
  // --- Reds ---
  "#ce4945": "--dsm-red-btn-background",
  "#aa3a37": "--dsm-red-border",
  "#bc433f": "--dsm-red-hovered",
  "#b03936": "--dsm-red-depressed",
  "#f00": "--dsm-multi-select-icon",
  "#e15855": "--dsm-generic-options-menu",
  "#c0504d": "--dsm-shared-btn-red-bg",
  "#ba4a47": "--dsm-shared-btn-red-border",
  "#b54848": "--dsm-shared-btn-red-hovered",
  "#ad1a1a": "--dsm-shared-dropdown-red-hovered",
  "#860606": "--dsm-shared-dropdown-red-depressed",
  "#fcc": "--account-modal-errors",
  // --- Yellows ---
  "#fef2ad": "--dsm-toast-bg",
  "#fed973": "--dsm-toast-border",
  "#fff0ab": "--dsm-preview-mode-bg",
  "#ffd76f": "--dsm-preview-mode-border",
  "#feeba1": "--dsm-geometry-beta-warning",
  "#fad54b": "--dsm-shared-cookie",
  // --- Oranges ---
  "#e66b3c": "--dsm-error-icon",
  "#fa824c": "--dsm-error-icon-bottom",
  "#fc944c": "--dsm-toast-error",
  // --- Blues ---
  "#d7e6ff": "--dsm-light-blue-background",
  "#6a93d2": "--dsm-expr-selected",
  "#5a87cd": "--dsm-naked-label",
  "#8bd": "--dsm-mq-focused-shadow",
  "#6ae": "--dsm-mq-focused-shadow-inset",
  "#709ac0": "--dsm-mq-focused-border",
  "#b4d5fe": "--dsm-mq-selection",
  "#407bb5": "--dsm-retry-loading-image",
  "#1d6fbf": "--dsm-secure-header",
  "#4dc7b4": "--dsm-contest-submission-teal",
  "#003566": "--dsm-modal-depression",
  // --- Purples ---
  "#7d69b3": "--dsm-multi-select-transformation",
  "#8c29be": "--dsm-geo-getting-started-1",
  "#4a0a69": "--dsm-geo-getting-started-2",
};

// Auto-duplicate #000 to #000000
// since sometimes #000c appears (which is equivalent to #00000cc)
// but sometimes #000000a6 appears
for (const from in colorMapping) {
  const match = /^#([a-zA-Z0-9]{3})$/.exec(from);
  if (!match) continue;
  colorMapping["#" + [...match[1]].flatMap((c) => [c, c]).join("")] =
    colorMapping[from];
}

// Auto-duplicate #2f72dc to 47,114,220 to handle appearing inside rgb()
for (const from in colorMapping) {
  const match = /^#([a-zA-Z0-9]{6})$/.exec(from);
  if (!match) continue;
  colorMapping[[0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16))] =
    colorMapping[from];
}

// Remove leading charset
css = css.replace('@charset "UTF-8";', "");
// Ensure close braces are always followed by newlines
css = css.replace(/}/g, "}\n");
// Remove block comments
css = css.replace(/\/\*([^*]|\*[^/])*\*\//gm, "");
// Remove @media blocks, which never have color changes
css = css.replace(
  /@(media|\S*keyframes)[^{}]*{[^{}]*({[^{}]*}[^{}]*)*[^{}]*}/gm,
  ""
);
// Remove lines with "var" already
// Restrict to lines starting with an even number of spaces
// to avoid mangling stuff
css = css.replace(/^( {2})+.*var.*$/gm, "");
// Replace based on the replacements in the colorMapping
for (const [from, to] of Object.entries(colorMapping)) {
  if (from.startsWith("#")) {
    css = css.replace(new RegExp(`${from}\\b`, "gi"), `rgb(var(${to}))`);
    // There's some occurrences of e.g. #2f72dc80 and #000c
    // Assume length is either 4 (#fff) or 7 (#2f72dc)
    const alphaLen = from.length === 4 ? 1 : 2;
    css = css.replace(
      new RegExp(`${from}([0-9a-z]{${alphaLen}})\\b`, "gi"),
      (m, a) => `rgba(var(${to}), ${parseInt(a, 16)})`
    );
  } else {
    // Three comma-separated numbers
    css = css.replace(new RegExp(`(?<=rgba?\\()${from}`, "gi"), `var(${to})`);
  }
}

// Remove .dcg-invalid rules, which are primary color then overwritten with red
css = css.replace(/,\n.*\.dcg-invalid/g, "");
// Remove lines without "var"
css = css
  .split("\n")
  .filter((e) => e.includes("var") || !e.includes(": "))
  .join("\n");
// Remove empty blocks
css = css.replace(/(?:[^\n]*,\n)*[^\n]*{\s*}/g, "");
// Remove duplicated newlines
css = css.replace(/\n{2,}/g, "\n");
// Remove leading ".dcg-calculator-api-container "
css = css.replaceAll(".dcg-calculator-api-container ", "");

css = ".dsm-set-primary-color.dcg-calculator-api-container { " + css + "}";

css = prettier.format(css, { parser: "css" });

fs.writeFileSync("_overrides.less", css);
