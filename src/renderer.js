import { NODE_COLORS, NODE_COLORS_DARK } from './styles.js';

function fmt(n) {
  if (typeof n !== 'number') return String(n);
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
  return String(Math.round(n * 10) / 10);
}

let uidCounter = 0;
function uid() { return ++uidCounter; }

const NODE_W = 420;
const HEADER_H = 32;
const LINE_H = 22;
const PAD = 10;
const V_GAP = 50;
const H_GAP = 30;
const TREE_PAD = 30;
const CORNER_R = 6;

const FONT_FAMILY = "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace";
const CHARS_PER_LINE = Math.floor((NODE_W - 2 * PAD) / 7.2); // ~55 at 12px monospace

function wrapText(text) {
  if (text.length <= CHARS_PER_LINE) return [text];
  const lines = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= CHARS_PER_LINE) {
      lines.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf(', ', CHARS_PER_LINE);
    if (cut < 10) cut = remaining.lastIndexOf(' ', CHARS_PER_LINE);
    if (cut < 10) cut = CHARS_PER_LINE;
    lines.push(remaining.substring(0, cut));
    const skip = remaining[cut] === ',' ? 2 : 1;
    remaining = remaining.substring(cut + skip).trimStart();
  }
  return lines;
}

function getColor(type, isDark) {
  const palette = isDark ? NODE_COLORS_DARK : NODE_COLORS;
  const lower = type.toLowerCase();
  if (/scan/i.test(lower)) return palette.scan;
  if (/join|nested loop|hash|merge/i.test(lower) && !/scan/i.test(lower)) return palette.join;
  if (/sort|aggregate|group/i.test(lower)) return palette.aggregate;
  if (/insert|update|delete|modify/i.test(lower)) return palette.modify;
  if (/limit|subquery|append|result|unique|materialize|setop/i.test(lower)) return palette.other;
  return palette.scan;
}

function getNodeHeight(node) {
  let h = HEADER_H + PAD;
  if (node.relation) h += LINE_H;
  if (node.notes) h += node.notes.length * LINE_H;
  h += PAD;
  return h;
}

function calcSubtreeWidth(node, depth) {
  if (!node.children || node.children.length === 0) {
    return NODE_W;
  }
  let totalW = 0;
  for (const child of node.children) {
    totalW += calcSubtreeWidth(child, depth + 1);
  }
  totalW += (node.children.length - 1) * H_GAP;
  return Math.max(NODE_W, totalW);
}

function layoutTree(node, x, y, depth, layout) {
  const nodeH = getNodeHeight(node);

  if (!node.children || node.children.length === 0) {
    layout.push({ node, x, y, w: NODE_W, h: nodeH });
    return { x, width: NODE_W };
  }

  const childLayouts = [];
  let cx = x;
  for (const child of node.children) {
    const childW = calcSubtreeWidth(child, depth + 1);
    const result = layoutTree(child, cx, y + nodeH + V_GAP, depth + 1, layout);
    childLayouts.push({ node: child, x: result.x, width: childW, childCenter: result.x + childW / 2 });
    cx += childW + H_GAP;
  }

  const childrenStart = childLayouts[0].x;
  const childrenEnd = childLayouts[childLayouts.length - 1].x + childLayouts[childLayouts.length - 1].width;
  const subtreeW = childrenEnd - childrenStart;

  const nodeX = childrenStart + subtreeW / 2 - NODE_W / 2;
  layout.push({ node, x: nodeX, y, w: NODE_W, h: nodeH });

  return { x: childrenStart, width: subtreeW };
}

function renderNodeSVG(svg, layoutItem, color, isDark) {
  const { node, x, y, w, h } = layoutItem;
  const bg = isDark ? '#1e1e2e' : '#ffffff';
  const textColor = isDark ? '#cdd6f4' : '#1e1e2e';
  const mutedColor = isDark ? '#6c7086' : '#6b7280';
  const borderColor = isDark ? '#313244' : '#e5e7eb';

  const g = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
  g.setAttribute('class', 'plan-node');

  const shadowId = `plan-shadow-${uid()}`;

  // Shadow
  const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  shadow.setAttribute('id', shadowId);
  shadow.innerHTML = `<feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>`;
  svg.appendChild(shadow);

  // Main rect
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', CORNER_R);
  rect.setAttribute('ry', CORNER_R);
  rect.setAttribute('fill', bg);
  rect.setAttribute('stroke', borderColor);
  rect.setAttribute('stroke-width', '1');
  rect.setAttribute('filter', `url(#${shadowId})`);
  g.appendChild(rect);

  // Header
  const header = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  header.setAttribute('x', x);
  header.setAttribute('y', y);
  header.setAttribute('width', w);
  header.setAttribute('height', HEADER_H);
  header.setAttribute('rx', CORNER_R);
  header.setAttribute('ry', CORNER_R);
  header.setAttribute('fill', color);
  g.appendChild(header);

  // Clip header top corners only
  const clipId = `plan-clip-${uid()}`;
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', clipId);
  const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  clipRect.setAttribute('x', x);
  clipRect.setAttribute('y', y);
  clipRect.setAttribute('width', w);
  clipRect.setAttribute('height', HEADER_H);
  clipRect.setAttribute('rx', CORNER_R);
  clipRect.setAttribute('ry', CORNER_R);
  clipPath.appendChild(clipRect);
  svg.appendChild(clipPath);
  header.setAttribute('clip-path', `url(#${clipId})`);

  // Badge / icon circle
  const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  badge.setAttribute('cx', x + 18);
  badge.setAttribute('cy', y + HEADER_H / 2);
  badge.setAttribute('r', 7);
  badge.setAttribute('fill', 'rgba(255,255,255,0.3)');
  g.appendChild(badge);

  // Node type text
  const typeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  typeText.setAttribute('x', x + 32);
  typeText.setAttribute('y', y + HEADER_H / 2 + 1);
  typeText.setAttribute('fill', '#ffffff');
  typeText.setAttribute('font-family', FONT_FAMILY);
  typeText.setAttribute('font-size', '14');
  typeText.setAttribute('font-weight', '600');
  typeText.setAttribute('dominant-baseline', 'middle');
  typeText.textContent = node.type;
  g.appendChild(typeText);

  // Body content
  let ly = y + HEADER_H + PAD;

  if (node.relation) {
    const relText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    relText.setAttribute('x', x + PAD);
    relText.setAttribute('y', ly + LINE_H / 2);
    relText.setAttribute('fill', textColor);
    relText.setAttribute('font-family', FONT_FAMILY);
    relText.setAttribute('font-size', '13');
    relText.setAttribute('font-weight', '600');
    relText.setAttribute('dominant-baseline', 'middle');

    const iconSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    iconSpan.setAttribute('fill', mutedColor);
    iconSpan.textContent = '\u25B6 ';
    relText.appendChild(iconSpan);
    const nameSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    nameSpan.textContent = node.relation;
    relText.appendChild(nameSpan);
    g.appendChild(relText);
    ly += LINE_H;
  }

  // Notes (row calc + analysis)
  if (node.notes) {
    const noteColor = isDark ? '#6c7086' : '#888';
    for (const note of node.notes) {
      const isRowNote = /^Rows:/i.test(note);
      const nText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nText.setAttribute('x', x + PAD);
      nText.setAttribute('y', ly + LINE_H / 2);
      nText.setAttribute('fill', noteColor);
      nText.setAttribute('font-family', FONT_FAMILY);
      nText.setAttribute('font-size', isRowNote ? '12' : '11');
      if (!isRowNote) nText.setAttribute('font-style', 'italic');
      nText.setAttribute('dominant-baseline', 'middle');

      const prefixSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      prefixSpan.setAttribute('fill', noteColor);
      prefixSpan.textContent = '\u24D8 ';
      nText.appendChild(prefixSpan);

      const valSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      valSpan.setAttribute('fill', textColor);
      if (isRowNote) valSpan.setAttribute('font-weight', '700');
      const colon = note.indexOf(':');
      if (isRowNote && colon > 0) {
        const labelSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        labelSpan.setAttribute('fill', textColor);
        labelSpan.setAttribute('font-weight', '700');
        labelSpan.textContent = note.substring(0, colon + 1);
        nText.appendChild(labelSpan);
        const restSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        restSpan.setAttribute('fill', textColor);
        restSpan.setAttribute('font-weight', '400');
        restSpan.textContent = note.substring(colon + 1);
        nText.appendChild(restSpan);
      } else {
        valSpan.textContent = note;
        nText.appendChild(valSpan);
      }

      g.appendChild(nText);
      ly += LINE_H;
    }
  }
}

function renderConnector(svg, x1, y1, x2, y2, isDark) {
  const color = isDark ? '#45475a' : '#d1d5db';
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-linecap', 'round');
  svg.appendChild(line);

  // Small dot at child
  if (x1 !== x2) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x2);
    dot.setAttribute('cy', y2);
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', color);
    svg.appendChild(dot);
  }
}

function renderMeta(svg, meta, svgW, isDark) {
  if (!meta || (!meta.planningTime && !meta.executionTime)) return;

  const textColor = isDark ? '#6c7086' : '#6b7280';
  const y = svgW > 600 ? 20 : 10;
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', svgW - 15);
  text.setAttribute('y', y);
  text.setAttribute('fill', textColor);
  text.setAttribute('font-family', FONT_FAMILY);
  text.setAttribute('font-size', '11');
  text.setAttribute('text-anchor', 'end');

  const parts = [];
  if (meta.planningTime !== null) parts.push(`Planning: ${meta.planningTime}ms`);
  if (meta.executionTime !== null) parts.push(`Execution: ${meta.executionTime}ms`);
  text.textContent = parts.join('  |  ');

  svg.appendChild(text);
}

export function renderPlan(planData, svgId, isDark) {
  if (!planData || !planData.root) return;

  const svg = document.getElementById(svgId);
  if (!svg) return;

  svg.innerHTML = '';

  const layout = [];
  const rootNode = planData.root;

  const startX = TREE_PAD;
  const startY = TREE_PAD + 30;

  layoutTree(rootNode, startX, startY, 0, layout);

  // Calculate total dimensions
  let maxW = 0;
  let maxH = 0;
  for (const item of layout) {
    const right = item.x + item.w;
    const bottom = item.y + item.h;
    if (right > maxW) maxW = right;
    if (bottom > maxH) maxH = bottom;
  }
  const origMaxBottom = maxH;
  maxW += TREE_PAD;
  maxH += TREE_PAD;

  // Flip Y so leaves are at top and root at bottom (data-flow direction)
  for (const item of layout) {
    item.y = origMaxBottom - item.y - item.h + startY;
  }

  // Draw connectors (from top-center of parent to bottom-center of child)
  for (let i = 0; i < layout.length; i++) {
    const child = layout[i];
    if (child.node.depth === 0) continue;
    const parent = findParentLayout(layout, child);
    if (parent) {
      const px = parent.x + parent.w / 2;
      const py = parent.y;                           // parent TOP edge
      const cx = child.x + child.w / 2;
      const cy = child.y + child.h;                  // child BOTTOM edge
      const turnY = cy + 10;
      renderConnector(svg, px, py, px, turnY, isDark);
      renderConnector(svg, px, turnY, cx, turnY, isDark);
      renderConnector(svg, cx, turnY, cx, cy, isDark);
    }
  }

  // Draw nodes
  const color = getColor(rootNode.type, isDark);
  for (const item of layout) {
    const nodeColor = getColor(item.node.type, isDark);
    renderNodeSVG(svg, item, nodeColor, isDark);
  }

  // Render meta
  renderMeta(svg, planData.meta, maxW, isDark);

  // Set SVG dimensions
  svg.setAttribute('viewBox', `0 0 ${maxW} ${maxH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('style', `max-width: ${Math.min(maxW, 1200)}px;`);
}

function findParentLayout(layout, child) {
  const start = layout.indexOf(child);
  for (let i = start + 1; i < layout.length; i++) {
    const p = layout[i];
    if (p.node.depth < child.node.depth) {
      return p;
    }
  }
  return null;
}
