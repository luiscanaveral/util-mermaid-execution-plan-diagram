# Mermaid PostgreSQL Execution Plan Diagram

A custom [Mermaid.js](https://mermaid.js.org) plugin that renders `EXPLAIN (ANALYZE, COSTS, BUFFERS, FORMAT TEXT)` output as interactive tree diagrams, color-coded by node type.

## Quick Demo

Serve the project root and open `demo/index.html`:

```bash
python3 -m http.server 8080
# open http://localhost:8080/demo/index.html
```

## Usage

### In a browser with CDN

```html
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import { pgPlanDiagram } from './path/to/src/index.js';

await mermaid.registerExternalDiagrams([pgPlanDiagram], { lazyLoad: false });
mermaid.initialize({ theme: 'base', securityLevel: 'loose' });
await mermaid.run({ querySelector: '.mermaid' });
</script>

<pre class="mermaid">
pg-plan
 Sort  (cost=1000.45..1000.46 rows=1 width=8) (actual time=0.045..0.046 rows=1 loops=1)
   Sort Key: id
   ->  Seq Scan on users  (cost=0.00..1000.00 rows=1 width=8) (actual time=0.012..0.013 rows=1 loops=1)
         Filter: (id > 100)
 Planning Time: 0.065 ms
 Execution Time: 0.064 ms
</pre>
```

The `pg-plan` prefix on the first line tells Mermaid to use this diagram type. You can also omit it and paste raw `EXPLAIN` output directly — the detector will auto-detect.

### With npm / bundler

```bash
npm install mermaid-pg-plan-diagram
```

```javascript
import mermaid from 'mermaid';
import { pgPlanDiagram } from 'mermaid-pg-plan-diagram';

await mermaid.registerExternalDiagrams([pgPlanDiagram], { lazyLoad: false });
mermaid.initialize({ theme: 'base' });
```

## How it works

1. **Detector** — The plugin auto-detects PostgreSQL execution plans by checking for `EXPLAIN` keywords, `(cost=...)` patterns, and plan node markers (`->`).
2. **Parser** (`src/parser.js`) — Converts the indented EXPLAIN output into a structured tree with node type, relation, costs, actuals, and properties.
3. **Renderer** (`src/renderer.js`) — Draws the tree using SVG, with color-coded cards:
   - Green: Scan nodes (Seq Scan, Index Scan, Bitmap Scan, etc.)
   - Blue: Join nodes (Nested Loop, Hash Join, Merge Join)
   - Orange: Sort / Aggregate nodes
   - Red: Modify nodes (Insert, Update, Delete)
   - Gray: Other nodes (Limit, Subquery Scan, Materialize, etc.)
4. **Styling** (`src/styles.js`) — Supports both light and dark themes.

## Supported EXPLAIN output

Works with standard `EXPLAIN (FORMAT TEXT)` and `EXPLAIN (ANALYZE, COSTS, BUFFERS, FORMAT TEXT)` output. Supported plan nodes include:

- Sequential Scans, Index Scans, Bitmap Scans
- Nested Loops, Hash Joins, Merge Joins
- Sorts, Aggregates (Hash, Group, etc.)
- Inserts, Updates, Deletes
- Limits, Subquery Scans, Materialize, Unique, Append, SetOp, Result

Properties like `Filter:`, `Index Cond:`, `Hash Cond:`, `Join Filter:`, `Sort Key:`, `Buffers:`, and timing metadata (Planning Time, Execution Time) are rendered inline.

## Project structure

```
src/
  parser.js    — PostgreSQL EXPLAIN text → tree structure
  renderer.js  — Tree → SVG drawing
  styles.js    — Color palette and CSS
  diagram.js   — Mermaid DiagramDefinition adapter
  index.js     — Main entry (ExternalDiagramDefinition with detector + loader)
demo/
  index.html   — Demo page with 8 example plans
```

## API

### `pgPlanDiagram`

```javascript
{
  id: 'pg-plan',
  detector: (text) => boolean,
  loader: () => Promise<{ id: 'pg-plan', diagram: DiagramDefinition }>
}
```

Pass this to `mermaid.registerExternalDiagrams()`.

### `parseExplainPlan(text)`

```javascript
import { parseExplainPlan } from './src/parser.js';

const result = parseExplainPlan(`
 Sort  (cost=1000.45..1000.46 rows=1 width=8)
   Sort Key: id
   ->  Seq Scan on users  (cost=0.00..1000.00 rows=1 width=8)
         Filter: (id > 100)
`);

console.log(result.root.type);       // "Sort"
console.log(result.root.children[0].type);  // "Seq Scan"
console.log(result.root.children[0].properties[0].key);   // "Filter"
console.log(result.meta.planningTime);  // null or number
```

Returns `{ root: PlanNode, nodes: PlanNode[], meta: { planningTime, executionTime } }`.
