const NODE_TYPE_PATTERN = /^(?:->\s+)?(\w+(?:\s+\w+)*?)\s+(?:on\s+(\S+(?:\s+\S+)?))?\s*/;
const COST_PATTERN = /cost=([\d.]+)\.\.([\d.]+)\s+rows=([\d.]+)\s+width=(\d+)/;
const ACTUAL_PATTERN = /actual\s+time=([\d.]+)\.\.([\d.]+)\s+rows=([\d.]+)\s+loops=(\d+)/;

function parseNodeLine(line) {
  const trimmed = line.trim();
  const result = {
    type: '',
    relation: '',
    startupCost: 0,
    totalCost: 0,
    rows: 0,
    width: 0,
    actualStartup: 0,
    actualTotal: 0,
    actualRows: 0,
    loops: 0,
    hasActuals: false,
    properties: [],
    raw: trimmed,
  };

  const costMatch = trimmed.match(COST_PATTERN);
  if (costMatch) {
    result.startupCost = parseFloat(costMatch[1]);
    result.totalCost = parseFloat(costMatch[2]);
    result.rows = parseFloat(costMatch[3]);
    result.width = parseInt(costMatch[4], 10);
  }

  const actualMatch = trimmed.match(ACTUAL_PATTERN);
  if (actualMatch) {
    result.hasActuals = true;
    result.actualStartup = parseFloat(actualMatch[1]);
    result.actualTotal = parseFloat(actualMatch[2]);
    result.actualRows = parseFloat(actualMatch[3]);
    result.loops = parseInt(actualMatch[4], 10);
  }

  const costIndex = trimmed.indexOf('(cost=');
  const nodePart = costIndex >= 0 ? trimmed.substring(0, costIndex).trim() : trimmed;

  const arrowMatch = nodePart.match(/^->\s+(.*)/);
  const cleanNodePart = arrowMatch ? arrowMatch[1].trim() : nodePart;

  const onMatch = cleanNodePart.match(/^(.+?)\s+on\s+(.+)/);
  if (onMatch) {
    result.type = onMatch[1].trim();
    result.relation = onMatch[2].trim();
  } else {
    result.type = cleanNodePart;
  }

  return result;
}

function stripHeader(lines) {
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^-{10,}/.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  const trimmed = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() && !line.includes('QUERY PLAN')) {
      trimmed.push(line);
    }
  }
  return trimmed;
}

const PROPERTY_PREFIXES = [
  'Filter:', 'Rows Removed by Filter:', 'Sort Key:', 'Sort Method:',
  'Hash Cond:', 'Join Filter:', 'Index Cond:', 'Recheck Cond:',
  'Heap Fetches:', 'Index Only Scan:', 'Bitmap', 'Buffers:', 'Memory:',
  'Merge Cond:', 'Materialize', 'SubPlan', 'Function Call:', 'Planning Time:',
  'Execution Time:', 'Triggers:', 'Planning', 'Execution',
];

function isPropertyLine(line) {
  return PROPERTY_PREFIXES.some(p =>
    line.trim().startsWith(p) || /\w+:/.test(line.trim())
  );
}

function getIndentDepth(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

const JSON_PROPERTY_KEYS = [
  ['Strategy', 'Strategy'],
  ['Partial Mode', 'Partial Mode'],
  ['Parallel Aware', 'Parallel Aware'],
  ['Filter', 'Filter'],
  ['Join Filter', 'Join Filter'],
  ['Hash Cond', 'Hash Cond'],
  ['Index Cond', 'Index Cond'],
  ['Recheck Cond', 'Recheck Cond'],
  ['Sort Key', 'Sort Key'],
  ['Sort Method', 'Sort Method'],
  ['Sort Space Used', 'Sort Space Used'],
  ['Sort Space Type', 'Sort Space Type'],
  ['Group Key', 'Group Key'],
  ['Merge Cond', 'Merge Cond'],
  ['Heap Fetches', 'Heap Fetches'],
  ['Workers Planned', 'Workers Planned'],
  ['Workers Launched', 'Workers Launched'],
  ['Output', 'Output'],
];

function convertJSONNode(jsonNode, depth) {
  const node = {
    type: jsonNode['Node Type'] || '',
    relation: jsonNode['Relation Name'] || '',
    startupCost: jsonNode['Startup Cost'] ?? 0,
    totalCost: jsonNode['Total Cost'] ?? 0,
    rows: jsonNode['Plan Rows'] ?? 0,
    width: jsonNode['Plan Width'] ?? 0,
    actualStartup: jsonNode['Actual Startup Time'] ?? 0,
    actualTotal: jsonNode['Actual Total Time'] ?? 0,
    actualRows: jsonNode['Actual Rows'] ?? 0,
    loops: jsonNode['Actual Loops'] ?? 0,
    hasActuals: jsonNode['Actual Startup Time'] != null,
    properties: [],
    depth,
    children: [],
  };

  for (const [key, label] of JSON_PROPERTY_KEYS) {
    if (jsonNode[key] != null) {
      const val = Array.isArray(jsonNode[key]) ? jsonNode[key].join(', ') : jsonNode[key];
      node.properties.push({ key: label, value: String(val) });
    }
  }

  const BLOCK_FIELDS = [
    ['Shared Hit Blocks', 'Shared Hit'],
    ['Shared Read Blocks', 'Shared Read'],
    ['Temp Read Blocks', 'Temp Read'],
    ['Temp Written Blocks', 'Temp Written'],
  ];
  for (const [field, label] of BLOCK_FIELDS) {
    if (jsonNode[field] != null && jsonNode[field] !== 0) {
      node.properties.push({ key: label, value: String(jsonNode[field]) });
    }
  }

  node.notes = computeNodeNotes(node);

  if (jsonNode['Plans']) {
    for (const child of jsonNode['Plans']) {
      node.children.push(convertJSONNode(child, depth + 1));
    }
  }

  return node;
}

function flattenTree(node) {
  const result = [node];
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenTree(child));
    }
  }
  return result;
}

export function parseExplainPlanJSON(text) {
  const data = JSON.parse(text);
  // PostgreSQL FORMAT JSON returns [{"Plan": {...}}] — unwrap the array
  const obj = Array.isArray(data) ? data[0] : data;
  const meta = {
    planningTime: obj['Planning Time'] ?? null,
    executionTime: obj['Execution Time'] ?? null,
  };
  const root = convertJSONNode(obj['Plan'], 0);
  return { root, nodes: flattenTree(root), meta };
}

// Plain text parser — unchanged original code
export function parseExplainPlan(text) {
  if (!text || typeof text !== 'string') return null;

  const rawLines = text.split('\n');

  let lines = rawLines;

  // Strip diagram type prefix (e.g., "pg-plan") from first line
  if (lines.length > 0 && /^pg-plan\b/i.test(lines[0].trim())) {
    lines = lines.slice(1);
  }

  lines = stripHeader(lines);

  const nodes = [];
  const meta = { planningTime: null, executionTime: null };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^Planning Time:\s*([\d.]+)\s*ms/.test(trimmed)) {
      meta.planningTime = parseFloat(RegExp.$1);
      continue;
    }
    if (/^Execution Time:\s*([\d.]+)\s*ms/.test(trimmed)) {
      meta.executionTime = parseFloat(RegExp.$1);
      continue;
    }

    const hasArrow = line.includes('-> ');
    const indent = getIndentDepth(line);
    const isRoot = nodes.length === 0 && !hasArrow;

    if (hasArrow || isRoot) {
      const node = parseNodeLine(line);
      node.depth = hasArrow ? indent : 0;

      if (nodes.length > 0) {
        const parent = findParent(nodes, node.depth);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }

      node.properties = [];
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        const nextTrimmed = nextLine.trim();
        if (!nextTrimmed) break;
        if (nextLine.includes('-> ')) break;
        const nextIndent = getIndentDepth(nextLine);
        if (nextIndent <= indent) break;
        if (isPropertyLine(nextLine)) {
          node.properties.push(parseProperty(nextTrimmed));
        }
      }

      node.notes = computeNodeNotes(node);
      nodes.push(node);
    }
  }

  return { root: nodes[0] || null, nodes, meta };
}

function findParent(nodes, childDepth) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const parentDepth = n.depth;
    const childsDepth = childDepth;
    if (parentDepth < childsDepth) {
      return n;
    }
  }
  return null;
}

function parseProperty(text) {
  const colonIdx = text.indexOf(':');
  if (colonIdx > 0) {
    return { key: text.substring(0, colonIdx).trim(), value: text.substring(colonIdx + 1).trim() };
  }
  return { key: '', value: text.trim() };
}

function fmt(n) {
  if (typeof n !== 'number') return String(n);
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
  return String(Math.round(n * 10) / 10);
}

export function computeNodeNotes(node) {
  const notes = [];

  if (node.rows > 0 || node.hasActuals) {
    let s;
    if (node.rows > 0 && node.hasActuals) {
      const total = Math.round(node.actualRows * node.loops);
      s = `Rows: est ${fmt(node.rows)} / actual ${fmt(node.actualRows)} × ${node.loops} = ${fmt(total)}`;
    } else if (node.rows > 0) {
      s = `Rows: est ${fmt(node.rows)}`;
    } else {
      const total = Math.round(node.actualRows * node.loops);
      s = `Rows: actual ${fmt(node.actualRows)} × ${node.loops} = ${fmt(total)}`;
    }
    notes.push(s);
  }

  const wp = node.properties.find(p => p.key === 'Workers Planned');
  const wl = node.properties.find(p => p.key === 'Workers Launched');
  if (wp) {
    notes.push(`Workers: ${wp.value} planned${wl ? `, ${wl.value} launched` : ''}`);
  }

  return notes;
}

export function formatPlanSummary(parsed) {
  if (!parsed || !parsed.root) return '';
  const r = parsed.root;
  let s = `${r.type}`;
  if (r.relation) s += ` on ${r.relation}`;
  s += ` [cost=${r.startupCost}..${r.totalCost}, rows=${r.rows}]`;
  return s;
}

export function findNodeById(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}
