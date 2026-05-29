# Using pg-plan-diagram in Jupyter

Define a helper in your notebook to render plan diagrams inline:

```python
import json
from IPython.display import HTML, display

def draw_pg_plan(plan_text, plugin_path='dist/pg-plan-diagram.min.js'):
    with open(plugin_path) as f:
        plugin_code = f.read()

    html = f"""<div class="mermaid">{plan_text}</div>
<script type="module">
const code = {json.dumps(plugin_code)};
const url = URL.createObjectURL(new Blob([code], {{type: 'text/javascript'}}));
import m from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
const {{ diagram }} = await import(url);
m.registerExternalDiagrams([diagram]);
await m.run({{ querySelector: '.mermaid' }});
URL.revokeObjectURL(url);
</script>"""
    display(HTML(html))
```

## Usage — text EXPLAIN format

```python
draw_pg_plan("""pg-plan
Finalize GroupAggregate  (cost=788265.76..2150146.18 rows=10000052 width=51) (actual time=2898.106..3727.225 rows=1830 loops=1)
  Output: metric_name, (date_trunc('day'::text, recorded_at)), avg(value), max(value), min(value), count(*)
  Group Key: metrics.metric_name, (date_trunc('day'::text, metrics.recorded_at))
  ->  Gather Merge  (cost=788265.76..1875144.76 rows=8333376 width=75) (actual time=2897.643..3725.818 rows=5490 loops=1)
        ->  Partial GroupAggregate  (cost=787265.73..912266.37 rows=4166688 width=75) (actual time=2799.618..3615.215 rows=1830 loops=3)
              ->  Sort  (cost=787265.73..797682.45 rows=4166688 width=27) (actual time=2799.402..3224.097 rows=3333333 loops=3)
                    ->  Parallel Seq Scan on public.metrics  (cost=0.00..129740.60 rows=4166688 width=27) (actual time=135.546..678.481 rows=3333333 loops=3)
Planning Time: 0.717 ms
Execution Time: 3740.838 ms""")
```

## Usage — JSON EXPLAIN FORMAT

```python
import psycopg2, json

conn = psycopg2.connect("dbname=yourdb")
cur = conn.cursor()
cur.execute("EXPLAIN (ANALYZE, COSTS, BUFFERS, FORMAT JSON) SELECT ...")
row = cur.fetchone()
plan_json = json.dumps(row[0][0])  # row[0] is the JSON result

draw_pg_plan(f"pg-plan\n{plan_json}")
```

## Notes

- `dist/pg-plan-diagram.min.js` must be accessible from the notebook's working directory (adjust `plugin_path` if needed)
- Mermaid 11 is loaded from CDN (jsdelivr); requires internet
- The plugin code is inlined via a Blob URL so Mermaid can import it as an ES module
