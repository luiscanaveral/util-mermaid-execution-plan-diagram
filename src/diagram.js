import { parseExplainPlan, parseExplainPlanJSON } from './parser.js';
import { renderPlan } from './renderer.js';
import { getStyles } from './styles.js';

const DIAGRAM_PREFIX = /^pg-plan\b/i;

const db = {
  data: null,

  clear() {
    this.data = null;
  },

  getData() {
    return this.data;
  },

  setData(d) {
    this.data = d;
  },

  getConfig() {
    return {};
  },
};

const parser = {
  parser: { yy: db },
  parse(text) {
    let working = text;
    const lines = working.split('\n');
    // Strip pg-plan prefix
    const content = (lines.length > 0 && DIAGRAM_PREFIX.test(lines[0].trim()))
      ? lines.slice(1)
      : lines;
    // Filter Mermaid comment lines (%%...)
    const filtered = content.filter(l => !/^\s*%%/.test(l));
    working = filtered.join('\n');
    const trimmed = working.trim();
    const parsed = trimmed.startsWith('{')
      ? parseExplainPlanJSON(trimmed)
      : parseExplainPlan(trimmed);
    db.setData(parsed);
  },
};

const renderer = {
  draw(text, id, version, diagram) {
    const data = diagram.db.getData();
    const isDark = document.documentElement.classList.contains('dark');
    renderPlan(data, id, isDark);
  },
};

export const diagram = {
  db,
  parser,
  renderer,
  styles: getStyles,
};
