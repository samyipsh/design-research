// Renders ```mermaid blocks with the self-hosted Mermaid build, using the site's colors.
// Loaded only on pages that contain diagrams. Re-renders when light/dark mode changes.
// If rendering fails, the diagram source stays visible as plain text.
import mermaid from './vendor/mermaid/mermaid.esm.min.mjs';

const figures = [...document.querySelectorAll('figure[data-diagram]')];
const dark = window.matchMedia('(prefers-color-scheme: dark)');
for (const fig of figures) fig.dataset.source = fig.querySelector('code').textContent;

function themeVariables() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  return {
    darkMode: dark.matches,
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif',
    fontSize: '15px',
    background: v('--paper-raised'),
    primaryColor: v('--accent-soft'),
    primaryTextColor: v('--ink'),
    primaryBorderColor: v('--accent'),
    secondaryColor: v('--paper'),
    tertiaryColor: v('--paper-raised'),
    lineColor: v('--graphite'),
    textColor: v('--ink'),
    edgeLabelBackground: v('--paper-raised'),
    actorBkg: v('--accent-soft'),
    actorBorder: v('--accent'),
    actorTextColor: v('--ink'),
    actorLineColor: v('--graphite'),
    signalColor: v('--ink'),
    signalTextColor: v('--ink'),
    sequenceNumberColor: v('--paper-raised'),
    noteBkgColor: v('--diagram-note'),
    noteBorderColor: v('--c-warning'),
    noteTextColor: v('--ink'),
    labelBoxBkgColor: v('--paper-raised'),
    labelBoxBorderColor: v('--rule'),
    labelTextColor: v('--ink'),
    loopTextColor: v('--ink'),
    activationBkgColor: v('--accent-soft'),
    activationBorderColor: v('--accent'),
  };
}

// Wide diagrams shrink to fit, but never below two thirds so labels stay legible; past that the
// figure scrolls sideways instead.
const MIN_SCALE = 0.66;
const viewBoxWidth = (svg) => Number(/viewBox="[-\d.e]+ [-\d.e]+ ([\d.e]+)/.exec(svg)?.[1] ?? 0);
const sideways = /^(\s*(?:flowchart|graph)\s+)(LR|RL)\b/m;

function fit(svg) {
  const width = svg?.viewBox?.baseVal?.width;
  if (!width) return;
  svg.setAttribute('width', '100%');
  svg.style.maxWidth = `${Math.ceil(width)}px`;
  svg.style.minWidth = `${Math.round(width * MIN_SCALE)}px`;
}

async function render(fig, id) {
  const source = fig.dataset.source;
  const style = getComputedStyle(fig);
  const room = fig.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  let { svg } = await mermaid.render(id, source);
  // A left-to-right flowchart that would need sideways scrolling is laid out top-down
  // instead: same nodes, edges and labels, just stacked to suit a narrow screen.
  if (sideways.test(source) && viewBoxWidth(svg) * MIN_SCALE > room) {
    const stacked = await mermaid.render(`${id}-td`, source.replace(sideways, '$1TD'));
    if (viewBoxWidth(stacked.svg) < viewBoxWidth(svg)) svg = stacked.svg;
  }
  return svg;
}

let run = 0;
async function renderAll() {
  const current = ++run;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: themeVariables(),
    // Wrap long messages so sequence diagrams stay roughly phone-width instead of 1,500px+.
    sequence: { wrap: true, width: 150, actorMargin: 20, messageFontSize: 14, noteFontSize: 14, actorFontSize: 14 },
  });
  try {
    await document.fonts.load('15px Archivo');
  } catch {
    // Fall back to whatever font is available.
  }
  for (const [i, fig] of figures.entries()) {
    try {
      const svg = await render(fig, `diagram-${i}-${current}`);
      if (current !== run) return;
      fig.innerHTML = svg;
      fig.classList.add('is-rendered');
      fit(fig.querySelector('svg'));
    } catch (error) {
      console.error('Diagram could not be rendered; showing its source instead.', error);
      fig.classList.add('is-failed');
    }
  }
  document.dispatchEvent(new CustomEvent('diagrams:rendered'));
}

let lastWidth = window.innerWidth;
let timer;
window.addEventListener('resize', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (Math.abs(window.innerWidth - lastWidth) < 40) return;
    lastWidth = window.innerWidth;
    renderAll();
  }, 250);
});
dark.addEventListener('change', renderAll);
renderAll();
