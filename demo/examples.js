export const examples = [
  // ── Existing examples ──
  {
    title: 'Finalize GroupAggregate (TEXT)',
    category: 'SELECT',
    sql: 'EXPLAIN (ANALYZE, COSTS, BUFFERS) SELECT metric_name, date_trunc(\'day\', recorded_at), AVG(value), MAX(value), MIN(value), COUNT(*) FROM metrics GROUP BY metric_name, date_trunc(\'day\', recorded_at);',
    plan: ` Finalize GroupAggregate  (cost=788265.76..2150146.18 rows=10000052 width=51) (actual time=2898.106..3727.225 rows=1830 loops=1)
   Output: metric_name, (date_trunc('day'::text, recorded_at)), avg(value), max(value), min(value), count(*)
   Group Key: metrics.metric_name, (date_trunc('day'::text, metrics.recorded_at))
   Buffers: shared hit=2712 read=75033, temp read=98837 written=99030
   ->  Gather Merge  (cost=788265.76..1875144.76 rows=8333376 width=75) (actual time=2897.643..3725.818 rows=5490 loops=1)
         Output: metric_name, (date_trunc('day'::text, recorded_at)), (PARTIAL avg(value)), (PARTIAL max(value)), (PARTIAL min(value)), (PARTIAL count(*))
         Workers Planned: 2
         Workers Launched: 2
         Buffers: shared hit=2712 read=75033, temp read=98837 written=99030
         ->  Partial GroupAggregate  (cost=787265.73..912266.37 rows=4166688 width=75) (actual time=2799.618..3615.215 rows=1830 loops=3)
               Output: metric_name, (date_trunc('day'::text, recorded_at)), PARTIAL avg(value), PARTIAL max(value), PARTIAL min(value), PARTIAL count(*)
               Group Key: metrics.metric_name, (date_trunc('day'::text, metrics.recorded_at))
               Buffers: shared hit=2712 read=75033, temp read=98837 written=99030
               ->  Sort  (cost=787265.73..797682.45 rows=4166688 width=27) (actual time=2799.402..3224.097 rows=3333333 loops=3)
                     Output: metric_name, (date_trunc('day'::text, recorded_at)), value
                     Sort Key: metrics.metric_name, (date_trunc('day'::text, metrics.recorded_at))
                     Sort Method: external merge  Disk: 133792kB
                     Buffers: shared hit=2712 read=75033, temp read=98837 written=99030
                     ->  Parallel Seq Scan on public.metrics  (cost=0.00..129740.60 rows=4166688 width=27) (actual time=135.546..678.481 rows=3333333 loops=3)
                           Output: metric_name, date_trunc('day'::text, recorded_at), value
                           Buffers: shared hit=2624 read=75033
 Planning Time: 0.717 ms
 Execution Time: 3740.838 ms`,
  },
  {
    title: 'Parallel Aggregate with Sort (EXPLAIN FORMAT JSON)',
    category: 'SELECT',
    sql: 'EXPLAIN (ANALYZE, COSTS, BUFFERS, FORMAT JSON) SELECT metric_name, date_trunc(\'day\', recorded_at), AVG(value), MAX(value), MIN(value), COUNT(*) FROM metrics GROUP BY metric_name, date_trunc(\'day\', recorded_at);',
    format: 'json',
    plan: {"Plan":{"Node Type":"Aggregate","Strategy":"Sorted","Partial Mode":"Finalize","Parallel Aware":false,"Async Capable":false,"Startup Cost":788265.76,"Total Cost":2150146.18,"Plan Rows":10000052,"Plan Width":51,"Actual Startup Time":2624.92,"Actual Total Time":3461.001,"Actual Rows":1830,"Actual Loops":1,"Output":["metric_name","(date_trunc('day'::text, recorded_at))","avg(value)","max(value)","min(value)","count(*)"],"Group Key":["metrics.metric_name","(date_trunc('day'::text, metrics.recorded_at))"],"Shared Hit Blocks":1560,"Shared Read Blocks":76185,"Shared Dirtied Blocks":0,"Shared Written Blocks":0,"Local Hit Blocks":0,"Local Read Blocks":0,"Local Dirtied Blocks":0,"Local Written Blocks":0,"Temp Read Blocks":98845,"Temp Written Blocks":99038,"Plans":[{"Node Type":"Gather Merge","Parent Relationship":"Outer","Parallel Aware":false,"Async Capable":false,"Startup Cost":788265.76,"Total Cost":1875144.76,"Plan Rows":8333376,"Plan Width":75,"Actual Startup Time":2624.439,"Actual Total Time":3459.345,"Actual Rows":5490,"Actual Loops":1,"Output":["metric_name","(date_trunc('day'::text, recorded_at))","(PARTIAL avg(value))","(PARTIAL max(value))","(PARTIAL min(value))","(PARTIAL count(*))"],"Workers Planned":2,"Workers Launched":2,"Shared Hit Blocks":1560,"Shared Read Blocks":76185,"Shared Dirtied Blocks":0,"Shared Written Blocks":0,"Local Hit Blocks":0,"Local Read Blocks":0,"Local Dirtied Blocks":0,"Local Written Blocks":0,"Temp Read Blocks":98845,"Temp Written Blocks":99038,"Plans":[{"Node Type":"Aggregate","Strategy":"Sorted","Partial Mode":"Partial","Parent Relationship":"Outer","Parallel Aware":false,"Async Capable":false,"Startup Cost":787265.73,"Total Cost":912266.37,"Plan Rows":4166688,"Plan Width":75,"Actual Startup Time":2528.741,"Actual Total Time":3367.829,"Actual Rows":1830,"Actual Loops":3,"Output":["metric_name","(date_trunc('day'::text, recorded_at))","PARTIAL avg(value)","PARTIAL max(value)","PARTIAL min(value)","PARTIAL count(*)"],"Group Key":["metrics.metric_name","(date_trunc('day'::text, metrics.recorded_at))"],"Shared Hit Blocks":520,"Shared Read Blocks":25395,"Shared Dirtied Blocks":0,"Shared Written Blocks":0,"Local Hit Blocks":0,"Local Read Blocks":0,"Local Dirtied Blocks":0,"Local Written Blocks":0,"Temp Read Blocks":98845,"Temp Written Blocks":99038,"Plans":[{"Node Type":"Sort","Parent Relationship":"Outer","Parallel Aware":false,"Async Capable":false,"Startup Cost":787265.73,"Total Cost":797682.45,"Plan Rows":4166688,"Plan Width":27,"Actual Startup Time":2528.613,"Actual Total Time":3138.536,"Actual Rows":3333333,"Actual Loops":3,"Output":["metric_name","(date_trunc('day'::text, recorded_at))","value"],"Sort Key":["metrics.metric_name","(date_trunc('day'::text, metrics.recorded_at))"],"Sort Method":"external merge","Sort Space Used":133792,"Sort Space Type":"Disk","Shared Hit Blocks":520,"Shared Read Blocks":25395,"Shared Dirtied Blocks":0,"Shared Written Blocks":0,"Local Hit Blocks":0,"Local Read Blocks":0,"Local Dirtied Blocks":0,"Local Written Blocks":0,"Temp Read Blocks":98845,"Temp Written Blocks":99038,"Plans":[{"Node Type":"Seq Scan","Parent Relationship":"Outer","Parallel Aware":true,"Async Capable":false,"Relation Name":"metrics","Schema":"public","Alias":"metrics","Startup Cost":0.00,"Total Cost":129740.60,"Plan Rows":4166688,"Plan Width":27,"Actual Startup Time":135.546,"Actual Total Time":678.481,"Actual Rows":3333333,"Actual Loops":3,"Output":["metric_name","date_trunc('day'::text, recorded_at)","value"],"Shared Hit Blocks":520,"Shared Read Blocks":25395,"Shared Dirtied Blocks":0,"Shared Written Blocks":0,"Local Hit Blocks":0,"Local Read Blocks":0,"Local Dirtied Blocks":0,"Local Written Blocks":0,"Temp Read Blocks":0,"Temp Written Blocks":0}]}]}]}]},"Planning Time":0.717,"Execution Time":3740.838},
  },
  // ── User example: Full scan on telemetry ──
  {
    title: '#1 — Full scan on telemetry (no time filter)',
    category: 'SELECT',
    sql: 'SELECT metric_name, avg(value), max(value), min(value), count(*) FROM metrics GROUP BY metric_name;',
    plan: ` HashAggregate  (cost=100000.00..110000.00 rows=100 width=48) (actual time=4500.000..5500.000 rows=120 loops=1)
   Group Key: metric_name
   Batches: 1  Memory Usage: 4096kB
   ->  Seq Scan on metrics  (cost=0.00..85000.00 rows=10000000 width=16) (actual time=0.010..1200.000 rows=10000000 loops=1)
 Planning Time: 0.500 ms
 Execution Time: 5500.500 ms`,
  },
  // ── User example: Aggregation over entire events ──
  {
    title: '#2 — Aggregation over entire events table',
    category: 'SELECT',
    sql: 'SELECT event_type, count(*), count(DISTINCT user_id) FROM events GROUP BY event_type ORDER BY count(*) DESC;',
    plan: ` Sort  (cost=50000.00..50005.00 rows=20 width=16) (actual time=800.000..800.050 rows=15 loops=1)
   Sort Key: (count(*)) DESC
   Sort Method: quicksort  Memory: 25kB
   ->  HashAggregate  (cost=49000.00..49980.00 rows=20 width=16) (actual time=750.000..795.000 rows=15 loops=1)
         Group Key: event_type
         Batches: 1  Memory Usage: 401kB
         ->  Seq Scan on events  (cost=0.00..45000.00 rows=500000 width=8) (actual time=0.010..350.000 rows=500000 loops=1)
 Planning Time: 0.350 ms
 Execution Time: 805.000 ms`,
  },
  // ── User example: Text search on logs (no index) ──
  {
    title: '#3 — Text search on logs (no index on message)',
    category: 'SELECT',
    sql: "SELECT session_id, count(*) AS error_count FROM logs WHERE message ILIKE '%error%' OR message ILIKE '%fail%' OR message ILIKE '%timeout%' GROUP BY session_id ORDER BY error_count DESC;",
    plan: ` Sort  (cost=95000.00..95250.00 rows=100000 width=18) (actual time=3200.000..3250.000 rows=12000 loops=1)
   Sort Key: (count(*)) DESC
   Sort Method: external merge  Disk: 64000kB
   ->  HashAggregate  (cost=60000.00..70000.00 rows=100000 width=18) (actual time=1800.000..2800.000 rows=12000 loops=1)
         Group Key: session_id
         Batches: 1  Memory Usage: 8192kB
         ->  Seq Scan on logs  (cost=0.00..50000.00 rows=1000000 width=10) (actual time=0.010..800.000 rows=1000000 loops=1)
               Filter: ((message ~~* '%error%'::text) OR (message ~~* '%fail%'::text) OR (message ~~* '%timeout%'::text))
               Rows Removed by Filter: 900000
 Planning Time: 0.420 ms
 Execution Time: 3300.000 ms`,
  },
  // ── User example: Cross-table aggregation without filters ──
  {
    title: '#4 — Cross-table aggregation (subqueries)',
    category: 'SELECT',
    sql: 'SELECT u.id, u.name, (SELECT count(*) FROM posts WHERE fk_user_id = u.id) AS post_count, (SELECT count(*) FROM comments WHERE fk_user_id = u.id) AS comment_count, (SELECT count(*) FROM friends WHERE user_id = u.id OR friend_id = u.id) AS friend_count FROM users_profile u ORDER BY u.id;',
    plan: ` Sort  (cost=1000000.00..1000500.00 rows=100000 width=20) (actual time=5000.000..5020.000 rows=100000 loops=1)
   Sort Key: u.id
   Sort Method: quicksort  Memory: 10240kB
   ->  Seq Scan on users_profile u  (cost=0.00..950000.00 rows=100000 width=20) (actual time=0.010..4200.000 rows=100000 loops=1)
         SubPlan 1 (post_count)
           ->  Aggregate  (cost=2.50..2.51 rows=1 width=8) (actual time=0.015..0.015 rows=1 loops=100000)
                 ->  Index Only Scan using idx_posts_user on posts  (cost=0.50..2.50 rows=5 width=0) (actual time=0.010..0.012 rows=5 loops=100000)
                       Index Cond: (fk_user_id = u.id)
                       Heap Fetches: 5
         SubPlan 2 (comment_count)
           ->  Aggregate  (cost=4.00..4.01 rows=1 width=8) (actual time=0.030..0.030 rows=1 loops=100000)
                 ->  Index Only Scan using idx_comments_user on comments  (cost=0.50..4.00 rows=20 width=0) (actual time=0.020..0.025 rows=20 loops=100000)
                       Index Cond: (fk_user_id = u.id)
                       Heap Fetches: 20
         SubPlan 3 (friend_count)
           ->  Aggregate  (cost=6.00..6.01 rows=1 width=8) (actual time=0.050..0.050 rows=1 loops=100000)
                 ->  Seq Scan on friends  (cost=0.00..5.00 rows=10 width=0) (actual time=0.020..0.030 rows=10 loops=100000)
                       Filter: ((user_id = u.id) OR (friend_id = u.id))
                       Rows Removed by Filter: 999990
 Planning Time: 1.200 ms
 Execution Time: 5025.000 ms`,
  },
  // ── User example: All posts + comments for every user ──
  {
    title: '#5 — All posts + comments (multi-way joins)',
    category: 'SELECT',
    sql: 'SELECT u.name, p.content AS post_content, p.created_at AS post_date, c.content AS comment_content, c.created_at AS comment_date, cu.name AS commenter_name FROM users_profile u JOIN posts p ON p.fk_user_id = u.id JOIN comments c ON c.fk_post_id = p.id JOIN users_profile cu ON cu.id = c.fk_user_id ORDER BY u.id, p.created_at;',
    plan: ` Sort  (cost=2000000.00..2100000.00 rows=500000 width=128) (actual time=15000.000..15500.000 rows=800000 loops=1)
   Sort Key: u.id, p.created_at
   Sort Method: external merge  Disk: 256000kB
   ->  Hash Join  (cost=50000.00..1200000.00 rows=500000 width=128) (actual time=500.000..12000.000 rows=800000 loops=1)
         Hash Cond: (c.fk_user_id = cu.id)
         ->  Hash Join  (cost=25000.00..900000.00 rows=500000 width=96) (actual time=300.000..9000.000 rows=800000 loops=1)
               Hash Cond: (c.fk_post_id = p.id)
               ->  Hash Join  (cost=10000.00..600000.00 rows=500000 width=64) (actual time=200.000..5000.000 rows=800000 loops=1)
                     Hash Cond: (p.fk_user_id = u.id)
                     ->  Seq Scan on posts p  (cost=0.00..350000.00 rows=500000 width=36) (actual time=0.010..1000.000 rows=500000 loops=1)
                     ->  Hash  (cost=5000.00..5000.00 rows=100000 width=20) (actual time=150.000..150.000 rows=100000 loops=1)
                           ->  Seq Scan on users_profile u  (cost=0.00..5000.00 rows=100000 width=20) (actual time=0.010..80.000 rows=100000 loops=1)
               ->  Hash  (cost=10000.00..10000.00 rows=2000000 width=24) (actual time=200.000..200.000 rows=2000000 loops=1)
                     ->  Seq Scan on comments c  (cost=0.00..10000.00 rows=2000000 width=24) (actual time=0.010..150.000 rows=2000000 loops=1)
         ->  Hash  (cost=15000.00..15000.00 rows=100000 width=20) (actual time=100.000..100.000 rows=100000 loops=1)
               ->  Seq Scan on users_profile cu  (cost=0.00..5000.00 rows=100000 width=20) (actual time=0.010..50.000 rows=100000 loops=1)
 Planning Time: 2.500 ms
 Execution Time: 15520.000 ms`,
  },
  // ── User example: Friend-of-friend expansion ──
  {
    title: '#6 — Friend-of-friend expansion (explosive join)',
    category: 'SELECT',
    sql: "SELECT u.id AS user_id, u.name AS user_name, f2.friend_id AS friend_of_friend_id, uf.name AS friend_of_friend_name FROM users_profile u JOIN friends f1 ON f1.user_id = u.id JOIN friends f2 ON f2.user_id = f1.friend_id JOIN users_profile uf ON uf.id = f2.friend_id WHERE u.id <> f2.friend_id ORDER BY u.id;",
    plan: ` Sort  (cost=3000000.00..3500000.00 rows=4000000 width=24) (actual time=25000.000..26000.000 rows=5000000 loops=1)
   Sort Key: u.id
   Sort Method: external merge  Disk: 512000kB
   ->  Hash Join  (cost=50000.00..2000000.00 rows=4000000 width=24) (actual time=500.000..20000.000 rows=5000000 loops=1)
         Hash Cond: (f2.friend_id = uf.id)
         ->  Hash Join  (cost=30000.00..1200000.00 rows=4000000 width=16) (actual time=400.000..15000.000 rows=5000000 loops=1)
               Hash Cond: (f2.user_id = f1.friend_id)
               ->  Seq Scan on friends f2  (cost=0.00..500000.00 rows=1000000 width=8) (actual time=0.010..2000.000 rows=1000000 loops=1)
               ->  Hash  (cost=20000.00..20000.00 rows=1000000 width=16) (actual time=300.000..300.000 rows=1000000 loops=1)
                     ->  Hash Join  (cost=5000.00..20000.00 rows=1000000 width=16) (actual time=100.000..250.000 rows=1000000 loops=1)
                           Hash Cond: (f1.user_id = u.id)
                           ->  Seq Scan on friends f1  (cost=0.00..10000.00 rows=1000000 width=8) (actual time=0.010..50.000 rows=1000000 loops=1)
                           ->  Hash  (cost=3000.00..3000.00 rows=100000 width=20) (actual time=50.000..50.000 rows=100000 loops=1)
                                 ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=20) (actual time=0.010..30.000 rows=100000 loops=1)
         ->  Hash  (cost=10000.00..10000.00 rows=100000 width=8) (actual time=50.000..50.000 rows=100000 loops=1)
               ->  Seq Scan on users_profile uf  (cost=0.00..3000.00 rows=100000 width=8) (actual time=0.010..25.000 rows=100000 loops=1)
 Planning Time: 3.000 ms
 Execution Time: 26500.000 ms`,
  },
  // ── User example: Time-series self-join ──
  {
    title: '#7 — Time-series self-join (consecutive readings)',
    category: 'SELECT',
    sql: 'SELECT a.metric_name, a.recorded_at AS current_ts, a.value AS current_value, b.recorded_at AS previous_ts, b.value AS previous_value, (a.value - b.value) / NULLIF(b.value, 0) * 100 AS pct_change FROM metrics a JOIN metrics b ON b.metric_name = a.metric_name AND b.recorded_at = (SELECT max(recorded_at) FROM metrics WHERE metric_name = a.metric_name AND recorded_at < a.recorded_at) ORDER BY a.metric_name, a.recorded_at;',
    plan: ` Sort  (cost=8000000.00..8500000.00 rows=10000000 width=32) (actual time=60000.000..65000.000 rows=10000000 loops=1)
   Sort Key: a.metric_name, a.recorded_at
   Sort Method: external merge  Disk: 1024000kB
   ->  Merge Join  (cost=2000000.00..5000000.00 rows=10000000 width=32) (actual time=15000.000..45000.000 rows=10000000 loops=1)
         Merge Cond: ((a.metric_name = b.metric_name) AND (a.recorded_at = b.recorded_at))
         ->  Index Scan using idx_metrics_name_time on metrics a  (cost=0.50..2000000.00 rows=10000000 width=24) (actual time=0.010..15000.000 rows=10000000 loops=1)
         ->  Materialize  (cost=1000000.00..2000000.00 rows=10000000 width=16) (actual time=8000.000..25000.000 rows=10000000 loops=1)
               ->  Seq Scan on metrics b  (cost=0.00..1500000.00 rows=10000000 width=16) (actual time=0.010..5000.000 rows=10000000 loops=1)
                     SubPlan 1
                       ->  Aggregate  (cost=10.00..10.01 rows=1 width=8) (actual time=0.020..0.020 rows=1 loops=10000000)
                             ->  Seq Scan on metrics  (cost=0.00..10.00 rows=10 width=8) (actual time=0.010..0.015 rows=10 loops=10000000)
                                   Filter: ((metric_name = a.metric_name) AND (recorded_at < a.recorded_at))
                                   Rows Removed by Filter: 9999990
 Planning Time: 5.000 ms
 Execution Time: 65500.000 ms`,
  },
  // ── User example: INNER JOIN ──
  {
    title: '#8 — INNER JOIN (users with their posts)',
    category: 'SELECT',
    sql: 'SELECT u.name, p.content, p.created_at FROM users_profile u JOIN posts p ON p.fk_user_id = u.id;',
    plan: ` Hash Join  (cost=5000.00..350000.00 rows=500000 width=36) (actual time=50.000..3000.000 rows=500000 loops=1)
   Hash Cond: (p.fk_user_id = u.id)
   ->  Seq Scan on posts p  (cost=0.00..250000.00 rows=500000 width=28) (actual time=0.010..800.000 rows=500000 loops=1)
   ->  Hash  (cost=3000.00..3000.00 rows=100000 width=12) (actual time=40.000..40.000 rows=100000 loops=1)
         ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=12) (actual time=0.010..20.000 rows=100000 loops=1)
 Planning Time: 0.300 ms
 Execution Time: 3050.000 ms`,
  },
  // ── User example: LEFT JOIN ──
  {
    title: '#9 — LEFT JOIN (all users with or without posts)',
    category: 'SELECT',
    sql: 'SELECT u.name, p.id AS post_id, p.content FROM users_profile u LEFT JOIN posts p ON p.fk_user_id = u.id ORDER BY u.name;',
    plan: ` Sort  (cost=360000.00..370000.00 rows=500000 width=28) (actual time=3500.000..3600.000 rows=500000 loops=1)
   Sort Key: u.name
   Sort Method: quicksort  Memory: 51200kB
   ->  Hash Left Join  (cost=5000.00..200000.00 rows=500000 width=28) (actual time=50.000..2500.000 rows=500000 loops=1)
         Hash Cond: (p.fk_user_id = u.id)
         ->  Seq Scan on posts p  (cost=0.00..150000.00 rows=500000 width=20) (actual time=0.010..600.000 rows=500000 loops=1)
         ->  Hash  (cost=3000.00..3000.00 rows=100000 width=12) (actual time=40.000..40.000 rows=100000 loops=1)
               ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=12) (actual time=0.010..20.000 rows=100000 loops=1)
 Planning Time: 0.400 ms
 Execution Time: 3650.000 ms`,
  },
  // ── User example: RIGHT JOIN ──
  {
    title: '#10 — RIGHT JOIN (posts and commenters)',
    category: 'SELECT',
    sql: 'SELECT p.id AS post_id, u.name AS commenter, c.content FROM comments c RIGHT JOIN posts p ON p.id = c.fk_post_id LEFT JOIN users_profile u ON u.id = c.fk_user_id;',
    plan: ` Hash Right Join  (cost=10000.00..700000.00 rows=2000000 width=36) (actual time=100.000..5000.000 rows=2000000 loops=1)
   Hash Cond: (c.fk_post_id = p.id)
   ->  Hash Left Join  (cost=5000.00..400000.00 rows=2000000 width=24) (actual time=50.000..3000.000 rows=2000000 loops=1)
         Hash Cond: (c.fk_user_id = u.id)
         ->  Seq Scan on comments c  (cost=0.00..100000.00 rows=2000000 width=16) (actual time=0.010..500.000 rows=2000000 loops=1)
         ->  Hash  (cost=3000.00..3000.00 rows=100000 width=12) (actual time=40.000..40.000 rows=100000 loops=1)
               ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=12) (actual time=0.010..20.000 rows=100000 loops=1)
   ->  Hash  (cost=3000.00..3000.00 rows=500000 width=16) (actual time=40.000..40.000 rows=500000 loops=1)
         ->  Seq Scan on posts p  (cost=0.00..3000.00 rows=500000 width=16) (actual time=0.010..20.000 rows=500000 loops=1)
 Planning Time: 0.600 ms
 Execution Time: 5100.000 ms`,
  },
  // ── User example: FULL OUTER JOIN ──
  {
    title: '#11 — FULL OUTER JOIN (bidirectional friendships)',
    category: 'SELECT',
    sql: 'SELECT COALESCE(f1.user_id, f2.friend_id) AS user_id, COALESCE(f1.friend_id, f2.user_id) AS friend_id FROM friends f1 FULL OUTER JOIN friends f2 ON f2.user_id = f1.friend_id AND f2.friend_id = f1.user_id WHERE f1.user_id IS NULL OR f2.user_id IS NULL;',
    plan: ` Hash Full Join  (cost=50000.00..200000.00 rows=2000000 width=8) (actual time=500.000..3000.000 rows=1000000 loops=1)
   Hash Cond: ((f1.friend_id = f2.user_id) AND (f1.user_id = f2.friend_id))
   Filter: ((f1.user_id IS NULL) OR (f2.user_id IS NULL))
   Rows Removed by Filter: 500000
   ->  Seq Scan on friends f1  (cost=0.00..50000.00 rows=1000000 width=8) (actual time=0.010..500.000 rows=1000000 loops=1)
   ->  Hash  (cost=30000.00..30000.00 rows=1000000 width=8) (actual time=300.000..300.000 rows=1000000 loops=1)
         ->  Seq Scan on friends f2  (cost=0.00..30000.00 rows=1000000 width=8) (actual time=0.010..200.000 rows=1000000 loops=1)
 Planning Time: 0.800 ms
 Execution Time: 3050.000 ms`,
  },
  // ── User example: SELF JOIN (mutual friends) ──
  {
    title: '#12 — SELF JOIN (mutual friend recommendations)',
    category: 'SELECT',
    sql: "SELECT f1.user_id AS user_a, f2.friend_id AS suggested_friend, count(*) AS mutual_count FROM friends f1 JOIN friends f2 ON f2.user_id = f1.friend_id WHERE f2.friend_id <> f1.user_id AND (f1.user_id, f2.friend_id) NOT IN (SELECT user_id, friend_id FROM friends) GROUP BY f1.user_id, f2.friend_id ORDER BY mutual_count DESC;",
    plan: ` Sort  (cost=5000000.00..5500000.00 rows=5000000 width=12) (actual time=40000.000..45000.000 rows=8000000 loops=1)
   Sort Key: (count(*)) DESC
   Sort Method: external merge  Disk: 512000kB
   ->  HashAggregate  (cost=2000000.00..2500000.00 rows=5000000 width=12) (actual time=15000.000..25000.000 rows=8000000 loops=1)
         Group Key: f1.user_id, f2.friend_id
         Batches: 1  Memory Usage: 262144kB
         ->  Hash Anti Join  (cost=500000.00..1500000.00 rows=5000000 width=8) (actual time=5000.000..12000.000 rows=8000000 loops=1)
               Hash Cond: ((f1.user_id = friends.user_id) AND (f2.friend_id = friends.friend_id))
               ->  Hash Join  (cost=5000.00..500000.00 rows=5000000 width=8) (actual time=100.000..5000.000 rows=8000000 loops=1)
                     Hash Cond: (f2.user_id = f1.friend_id)
                     ->  Seq Scan on friends f2  (cost=0.00..30000.00 rows=1000000 width=8) (actual time=0.010..200.000 rows=1000000 loops=1)
                     ->  Hash  (cost=3000.00..3000.00 rows=1000000 width=8) (actual time=50.000..50.000 rows=1000000 loops=1)
                           ->  Seq Scan on friends f1  (cost=0.00..3000.00 rows=1000000 width=8) (actual time=0.010..30.000 rows=1000000 loops=1)
               ->  Hash  (cost=300000.00..300000.00 rows=1000000 width=8) (actual time=2000.000..2000.000 rows=1000000 loops=1)
                     ->  Seq Scan on friends  (cost=0.00..30000.00 rows=1000000 width=8) (actual time=0.010..500.000 rows=1000000 loops=1)
 Planning Time: 4.000 ms
 Execution Time: 46000.000 ms`,
  },
  // ── User example: CROSS JOIN ──
  {
    title: '#13 — CROSS JOIN (analytics grid)',
    category: 'SELECT',
    sql: "SELECT u.id AS user_id, e_types.event_type, count(e.id) AS event_count FROM users_profile u CROSS JOIN (SELECT DISTINCT event_type FROM events) e_types LEFT JOIN events e ON e.user_id = u.id AND e.event_type = e_types.event_type GROUP BY u.id, e_types.event_type ORDER BY u.id, e_types.event_type;",
    plan: ` Sort  (cost=800000.00..900000.00 rows=1500000 width=12) (actual time=6000.000..6500.000 rows=1500000 loops=1)
   Sort Key: u.id, e_types.event_type
   Sort Method: quicksort  Memory: 102400kB
   ->  HashAggregate  (cost=500000.00..600000.00 rows=1500000 width=12) (actual time=3000.000..4500.000 rows=1500000 loops=1)
         Group Key: u.id, e_types.event_type
         Batches: 1  Memory Usage: 102401kB
         ->  Hash Right Join  (cost=50000.00..300000.00 rows=1500000 width=8) (actual time=500.000..2500.000 rows=1500000 loops=1)
               Hash Cond: ((e.user_id = u.id) AND (e.event_type = e_types.event_type))
               ->  Seq Scan on events e  (cost=0.00..100000.00 rows=500000 width=8) (actual time=0.010..300.000 rows=500000 loops=1)
               ->  Hash  (cost=40000.00..40000.00 rows=1500000 width=8) (actual time=400.000..400.000 rows=1500000 loops=1)
                     ->  Nested Loop  (cost=5000.00..40000.00 rows=1500000 width=8) (actual time=100.000..350.000 rows=1500000 loops=1)
                           ->  HashAggregate  (cost=5000.00..5005.00 rows=15 width=8) (actual time=100.000..100.050 rows=15 loops=1)
                                 Group Key: events.event_type
                                 ->  Seq Scan on events  (cost=0.00..4500.00 rows=500000 width=8) (actual time=0.010..50.000 rows=500000 loops=1)
                           ->  Seq Scan on users_profile u  (cost=0.00..2000.00 rows=100000 width=4) (actual time=0.010..1.000 rows=100000 loops=1)
 Planning Time: 1.500 ms
 Execution Time: 6600.000 ms`,
  },
  // ── User example: Semi-join via EXISTS ──
  {
    title: '#14 — Semi-join via EXISTS (users who commented)',
    category: 'SELECT',
    sql: 'SELECT u.id, u.name, u.email FROM users_profile u WHERE EXISTS (SELECT 1 FROM comments c WHERE c.fk_user_id = u.id);',
    plan: ` Hash Semi Join  (cost=5000.00..150000.00 rows=80000 width=28) (actual time=50.000..2000.000 rows=80000 loops=1)
   Hash Cond: (u.id = c.fk_user_id)
   ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=28) (actual time=0.010..20.000 rows=100000 loops=1)
   ->  Hash  (cost=4000.00..4000.00 rows=2000000 width=4) (actual time=40.000..40.000 rows=2000000 loops=1)
         ->  Seq Scan on comments c  (cost=0.00..4000.00 rows=2000000 width=4) (actual time=0.010..20.000 rows=2000000 loops=1)
 Planning Time: 0.250 ms
 Execution Time: 2050.000 ms`,
  },
  // ── User example: Anti-join via NOT EXISTS ──
  {
    title: '#15 — Anti-join via NOT EXISTS (users who never posted)',
    category: 'SELECT',
    sql: 'SELECT u.id, u.name, u.email FROM users_profile u WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.fk_user_id = u.id);',
    plan: ` Hash Anti Join  (cost=5000.00..120000.00 rows=20000 width=28) (actual time=50.000..1000.000 rows=20000 loops=1)
   Hash Cond: (u.id = p.fk_user_id)
   ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=28) (actual time=0.010..20.000 rows=100000 loops=1)
   ->  Hash  (cost=3000.00..3000.00 rows=500000 width=4) (actual time=20.000..20.000 rows=500000 loops=1)
         ->  Seq Scan on posts p  (cost=0.00..3000.00 rows=500000 width=4) (actual time=0.010..10.000 rows=500000 loops=1)
 Planning Time: 0.200 ms
 Execution Time: 1050.000 ms`,
  },
  // ── User example: LATERAL join ──
  {
    title: '#16 — LATERAL join (top 3 comments per post)',
    category: 'SELECT',
    sql: 'SELECT p.id AS post_id, c.id AS comment_id, c.content AS comment_text, u.name AS commenter FROM posts p CROSS JOIN LATERAL (SELECT id, content, fk_user_id FROM comments WHERE fk_post_id = p.id ORDER BY created_at DESC LIMIT 3) c JOIN users_profile u ON u.id = c.fk_user_id ORDER BY p.id, c.id;',
    plan: ` Nested Loop  (cost=5000.00..2000000.00 rows=1500000 width=48) (actual time=100.000..15000.000 rows=1500000 loops=1)
   Join Filter: (u.id = c.fk_user_id)
   ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=12) (actual time=0.010..20.000 rows=100000 loops=1)
   ->  Materialize  (cost=5000.00..1000000.00 rows=1500000 width=24) (actual time=0.010..0.050 rows=1500000 loops=1)
         ->  Nested Loop  (cost=5000.00..500000.00 rows=1500000 width=24) (actual time=100.000..10000.000 rows=1500000 loops=1)
               ->  Seq Scan on posts p  (cost=0.00..3000.00 rows=500000 width=4) (actual time=0.010..10.000 rows=500000 loops=1)
               ->  Limit  (cost=1.00..1.50 rows=3 width=20) (actual time=0.020..0.020 rows=3 loops=500000)
                     ->  Sort  (cost=1.00..1.50 rows=3 width=20) (actual time=0.020..0.020 rows=3 loops=500000)
                           Sort Key: comments.created_at DESC
                           Sort Method: quicksort  Memory: 25kB
                           ->  Seq Scan on comments  (cost=0.00..1.00 rows=3 width=20) (actual time=0.010..0.010 rows=3 loops=500000)
                                 Filter: (fk_post_id = p.id)
                                 Rows Removed by Filter: 1999997
 Planning Time: 2.000 ms
 Execution Time: 15500.000 ms`,
  },
  // ── User example: Multi-way join with aggregation ──
  {
    title: '#17 — Multi-way join with aggregation (user engagement)',
    category: 'SELECT',
    sql: 'SELECT u.id, u.name, count(DISTINCT p.id) AS total_posts, count(DISTINCT c.id) AS total_comments_received, count(DISTINCT fr.user_id) AS friend_count FROM users_profile u LEFT JOIN posts p ON p.fk_user_id = u.id LEFT JOIN comments c ON c.fk_post_id = p.id LEFT JOIN friends fr ON fr.friend_id = u.id GROUP BY u.id, u.name ORDER BY total_posts DESC;',
    plan: ` Sort  (cost=3000000.00..3100000.00 rows=100000 width=16) (actual time=20000.000..20500.000 rows=100000 loops=1)
   Sort Key: (count(DISTINCT p.id)) DESC
   Sort Method: quicksort  Memory: 10240kB
   ->  GroupAggregate  (cost=2000000.00..2900000.00 rows=100000 width=16) (actual time=10000.000..18000.000 rows=100000 loops=1)
         Group Key: u.id, u.name
         ->  Sort  (cost=2000000.00..2200000.00 rows=4000000 width=16) (actual time=10000.000..12000.000 rows=4000000 loops=1)
               Sort Key: u.id, u.name
               Sort Method: external merge  Disk: 256000kB
               ->  Hash Left Join  (cost=100000.00..1000000.00 rows=4000000 width=16) (actual time=1000.000..8000.000 rows=4000000 loops=1)
                     Hash Cond: (p.fk_user_id = u.id)
                     ->  Hash Left Join  (cost=50000.00..500000.00 rows=2000000 width=12) (actual time=500.000..4000.000 rows=2000000 loops=1)
                           Hash Cond: (p.id = c.fk_post_id)
                           ->  Hash Left Join  (cost=25000.00..250000.00 rows=500000 width=8) (actual time=300.000..2000.000 rows=500000 loops=1)
                                 Hash Cond: (u.id = fr.friend_id)
                                 ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=12) (actual time=0.010..20.000 rows=100000 loops=1)
                                 ->  Hash  (cost=15000.00..15000.00 rows=1000000 width=4) (actual time=200.000..200.000 rows=1000000 loops=1)
                                       ->  Seq Scan on friends fr  (cost=0.00..15000.00 rows=1000000 width=4) (actual time=0.010..100.000 rows=1000000 loops=1)
                           ->  Hash  (cost=15000.00..15000.00 rows=2000000 width=8) (actual time=150.000..150.000 rows=2000000 loops=1)
                                 ->  Seq Scan on comments c  (cost=0.00..10000.00 rows=2000000 width=8) (actual time=0.010..80.000 rows=2000000 loops=1)
                     ->  Hash  (cost=30000.00..30000.00 rows=500000 width=4) (actual time=300.000..300.000 rows=500000 loops=1)
                           ->  Seq Scan on posts p  (cost=0.00..25000.00 rows=500000 width=4) (actual time=0.010..150.000 rows=500000 loops=1)
 Planning Time: 5.000 ms
  Execution Time: 21000.000 ms`,
  },
  // ── INSERT examples ──
  {
    title: '#18 — INSERT single row (VALUES)',
    category: 'INSERT',
    sql: "INSERT INTO users_profile (email, name) VALUES ('alice@example.com', 'Alice');",
    plan: ` Insert on users_profile  (cost=0.00..0.01 rows=0 width=0) (actual time=0.080..0.080 rows=0 loops=1)
 Planning Time: 0.040 ms
 Execution Time: 0.090 ms`,
  },
  {
    title: '#19 — INSERT ... SELECT (bulk copy)',
    category: 'INSERT',
    sql: 'INSERT INTO logs (session_id, message, timestamp) SELECT session_id, message, timestamp FROM events WHERE event_type = \'page_view\';',
    plan: ` Insert on logs  (cost=0.00..45000.00 rows=0 width=0) (actual time=850.000..850.000 rows=0 loops=1)
   ->  Seq Scan on events  (cost=0.00..45000.00 rows=150000 width=20) (actual time=0.010..350.000 rows=150000 loops=1)
         Filter: (event_type = 'page_view'::text)
         Rows Removed by Filter: 350000
 Planning Time: 0.350 ms
 Execution Time: 855.000 ms`,
  },
  {
    title: '#20 — INSERT ON CONFLICT (upsert)',
    category: 'INSERT',
    sql: "INSERT INTO users_profile (id, email, name) VALUES (42, 'bob@example.com', 'Bob') ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name;",
    plan: ` Insert on users_profile  (cost=0.00..0.01 rows=0 width=0) (actual time=0.120..0.120 rows=0 loops=1)
   Conflict Resolution: UPDATE
   Tuples Inserted: 1
   Conflicting Tuples: 0
   ->  Result  (cost=0.00..0.01 rows=1 width=52) (actual time=0.010..0.010 rows=1 loops=1)
 Planning Time: 0.080 ms
 Execution Time: 0.130 ms`,
  },
  {
    title: '#21 — INSERT ... SELECT with aggregation',
    category: 'INSERT',
    sql: 'INSERT INTO metrics_summary (metric_name, avg_val, max_val, min_val, cnt) SELECT metric_name, avg(value), max(value), min(value), count(*) FROM metrics GROUP BY metric_name;',
    plan: ` Insert on metrics_summary  (cost=100000.00..110000.00 rows=0 width=0) (actual time=5000.000..5000.000 rows=0 loops=1)
   ->  HashAggregate  (cost=100000.00..101000.00 rows=100 width=48) (actual time=4500.000..4900.000 rows=120 loops=1)
         Group Key: metric_name
         Batches: 1  Memory Usage: 4096kB
         ->  Seq Scan on metrics  (cost=0.00..75000.00 rows=10000000 width=16) (actual time=0.010..1000.000 rows=10000000 loops=1)
 Planning Time: 0.500 ms
 Execution Time: 5010.000 ms`,
  },
  // ── UPDATE examples ──
  {
    title: '#22 — UPDATE with sequential scan + filter',
    category: 'UPDATE',
    sql: "UPDATE users_profile SET name = upper(name) WHERE email LIKE '%@example.com';",
    plan: ` Update on users_profile  (cost=0.00..5000.00 rows=0 width=0) (actual time=350.000..350.000 rows=0 loops=1)
   ->  Seq Scan on users_profile  (cost=0.00..5000.00 rows=50000 width=38) (actual time=0.010..200.000 rows=50000 loops=1)
         Filter: ((email)::text ~~ '%@example.com'::text)
         Rows Removed by Filter: 50000
 Planning Time: 0.150 ms
 Execution Time: 355.000 ms`,
  },
  {
    title: '#23 — UPDATE with index scan (targeted row)',
    category: 'UPDATE',
    sql: "UPDATE users_profile SET email = 'new@example.com' WHERE id = 1001;",
    plan: ` Update on users_profile  (cost=0.50..8.50 rows=0 width=0) (actual time=0.080..0.080 rows=0 loops=1)
   ->  Index Scan using users_profile_pkey on users_profile  (cost=0.50..8.50 rows=1 width=38) (actual time=0.020..0.020 rows=1 loops=1)
         Index Cond: (id = 1001)
 Planning Time: 0.060 ms
 Execution Time: 0.090 ms`,
  },
  {
    title: '#24 — UPDATE with join (correlated)',
    category: 'UPDATE',
    sql: 'UPDATE posts SET content = content || \'\n\n[archived]\' FROM users_profile WHERE posts.fk_user_id = users_profile.id AND users_profile.email IS NULL;',
    plan: ` Update on posts  (cost=5000.00..150000.00 rows=0 width=0) (actual time=1200.000..1200.000 rows=0 loops=1)
   ->  Hash Join  (cost=5000.00..150000.00 rows=50000 width=38) (actual time=50.000..1000.000 rows=50000 loops=1)
         Hash Cond: (posts.fk_user_id = users_profile.id)
         ->  Seq Scan on posts  (cost=0.00..100000.00 rows=500000 width=10) (actual time=0.010..300.000 rows=500000 loops=1)
         ->  Hash  (cost=4000.00..4000.00 rows=50000 width=4) (actual time=40.000..40.000 rows=50000 loops=1)
               ->  Seq Scan on users_profile  (cost=0.00..4000.00 rows=50000 width=4) (actual time=0.010..20.000 rows=50000 loops=1)
                     Filter: (email IS NULL)
                     Rows Removed by Filter: 50000
 Planning Time: 0.400 ms
 Execution Time: 1210.000 ms`,
  },
  {
    title: '#25 — UPDATE RETURNING',
    category: 'UPDATE',
    sql: 'UPDATE friends SET created_at = now() WHERE user_id = 42 RETURNING user_id, friend_id, created_at;',
    plan: ` Update on friends  (cost=0.00..20000.00 rows=0 width=0) (actual time=20.000..20.000 rows=0 loops=1)
   ->  Seq Scan on friends  (cost=0.00..20000.00 rows=5000 width=12) (actual time=0.010..10.000 rows=5000 loops=1)
         Filter: (user_id = 42)
         Rows Removed by Filter: 995000
 Planning Time: 0.120 ms
 Execution Time: 22.000 ms`,
  },
  // ── DELETE examples ──
  {
    title: '#26 — DELETE with sequential scan + filter',
    category: 'DELETE',
    sql: "DELETE FROM logs WHERE message LIKE '%timeout%';",
    plan: ` Delete on logs  (cost=0.00..50000.00 rows=0 width=0) (actual time=3000.000..3000.000 rows=0 loops=1)
   ->  Seq Scan on logs  (cost=0.00..50000.00 rows=50000 width=6) (actual time=0.010..2000.000 rows=50000 loops=1)
         Filter: ((message)::text ~~ '%timeout%'::text)
         Rows Removed by Filter: 950000
 Planning Time: 0.200 ms
 Execution Time: 3005.000 ms`,
  },
  {
    title: '#27 — DELETE with index scan (single row)',
    category: 'DELETE',
    sql: 'DELETE FROM events WHERE id = \'a1b2c3d4-e5f6-7890-abcd-ef1234567890\';',
    plan: ` Delete on events  (cost=0.50..8.50 rows=0 width=0) (actual time=0.060..0.060 rows=0 loops=1)
   ->  Index Scan using events_pkey on events  (cost=0.50..8.50 rows=1 width=6) (actual time=0.020..0.020 rows=1 loops=1)
         Index Cond: ((id)::text = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::text)
 Planning Time: 0.050 ms
 Execution Time: 0.070 ms`,
  },
  {
    title: '#28 — DELETE with subquery (join)',
    category: 'DELETE',
    sql: 'DELETE FROM comments WHERE fk_post_id IN (SELECT id FROM posts WHERE created_at < \'2023-01-01\');',
    plan: ` Delete on comments  (cost=5000.00..100000.00 rows=0 width=0) (actual time=2500.000..2500.000 rows=0 loops=1)
   ->  Hash Semi Join  (cost=5000.00..100000.00 rows=200000 width=10) (actual time=50.000..2000.000 rows=200000 loops=1)
         Hash Cond: (comments.fk_post_id = posts.id)
         ->  Seq Scan on comments  (cost=0.00..40000.00 rows=2000000 width=10) (actual time=0.010..300.000 rows=2000000 loops=1)
         ->  Hash  (cost=3000.00..3000.00 rows=100000 width=4) (actual time=30.000..30.000 rows=100000 loops=1)
               ->  Seq Scan on posts  (cost=0.00..3000.00 rows=100000 width=4) (actual time=0.010..15.000 rows=100000 loops=1)
                     Filter: (created_at < '2023-01-01'::date)
                     Rows Removed by Filter: 400000
 Planning Time: 0.500 ms
 Execution Time: 2510.000 ms`,
  },
  {
    title: '#29 — DELETE with USING (multi-table)',
    category: 'DELETE',
    sql: 'DELETE FROM friends USING users_profile WHERE friends.friend_id = users_profile.id AND users_profile.email IS NULL;',
    plan: ` Delete on friends  (cost=5000.00..80000.00 rows=0 width=0) (actual time=500.000..500.000 rows=0 loops=1)
    ->  Hash Join  (cost=5000.00..80000.00 rows=50000 width=12) (actual time=50.000..400.000 rows=50000 loops=1)
          Hash Cond: (friends.friend_id = users_profile.id)
          ->  Seq Scan on friends  (cost=0.00..30000.00 rows=1000000 width=6) (actual time=0.010..100.000 rows=1000000 loops=1)
          ->  Hash  (cost=4000.00..4000.00 rows=50000 width=4) (actual time=30.000..30.000 rows=50000 loops=1)
                ->  Seq Scan on users_profile  (cost=0.00..4000.00 rows=50000 width=4) (actual time=0.010..15.000 rows=50000 loops=1)
                      Filter: (email IS NULL)
                      Rows Removed by Filter: 50000
  Planning Time: 0.300 ms
  Execution Time: 505.000 ms`,
  },
  // ── Node-type specific examples (A* series) ──
  {
    title: 'A1 — Function Scan (generate_series)',
    category: 'SELECT',
    sql: 'SELECT * FROM generate_series(1, 1000);',
    plan: ` Function Scan on generate_series  (cost=0.00..10.00 rows=1000 width=4) (actual time=0.010..5.000 rows=1000 loops=1)
  Planning Time: 0.050 ms
  Execution Time: 5.500 ms`,
  },
  {
    title: 'A2 — Values Scan (VALUES list)',
    category: 'SELECT',
    sql: 'SELECT * FROM (VALUES (1, \'Alice\'), (2, \'Bob\'), (3, \'Carol\')) AS t(id, name);',
    plan: ` Values Scan on "*VALUES*"  (cost=0.00..0.04 rows=3 width=36) (actual time=0.005..0.010 rows=3 loops=1)
  Planning Time: 0.030 ms
  Execution Time: 0.050 ms`,
  },
  {
    title: 'A3 — Index Only Scan (covering index)',
    category: 'SELECT',
    sql: "SELECT metric_name, recorded_at FROM metrics WHERE metric_name = 'cpu';",
    plan: ` Index Only Scan using idx_metrics_name_time on metrics  (cost=0.50..5000.00 rows=100000 width=24) (actual time=0.010..50.000 rows=100000 loops=1)
    Index Cond: (metric_name = 'cpu'::text)
    Heap Fetches: 0
  Planning Time: 0.150 ms
  Execution Time: 55.000 ms`,
  },
  {
    title: 'A4 — Bitmap Scan (range query on date)',
    category: 'SELECT',
    sql: "SELECT * FROM logs WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';",
    plan: ` Bitmap Heap Scan on logs  (cost=5000.00..50000.00 rows=50000 width=64) (actual time=50.000..300.000 rows=50000 loops=1)
    Recheck Cond: ((created_at >= '2024-01-01'::date) AND (created_at < '2024-02-01'::date))
    Buffers: shared hit=450 read=200
    ->  Bitmap Index Scan on idx_logs_created  (cost=0.00..5000.00 rows=50000 width=0) (actual time=40.000..40.000 rows=50000 loops=1)
          Index Cond: ((created_at >= '2024-01-01'::date) AND (created_at < '2024-02-01'::date))
          Buffers: shared hit=50 read=50
  Planning Time: 0.250 ms
  Execution Time: 310.000 ms`,
  },
  {
    title: 'A5 — CTE Scan (WITH clause)',
    category: 'SELECT',
    sql: 'WITH user_counts AS (SELECT user_id, count(*) AS cnt FROM events GROUP BY user_id) SELECT avg(cnt) FROM user_counts;',
    plan: ` Aggregate  (cost=10005.00..10005.01 rows=1 width=8) (actual time=150.000..150.010 rows=1 loops=1)
    ->  CTE Scan on user_counts  (cost=0.00..10005.00 rows=1000 width=4) (actual time=100.000..149.900 rows=1000 loops=1)
  Planning Time: 0.600 ms
  Execution Time: 150.500 ms`,
  },
  {
    title: 'A6 — Subquery Scan (FROM subquery)',
    category: 'SELECT',
    sql: 'SELECT * FROM (SELECT id, name FROM users_profile WHERE email IS NOT NULL) AS active_users;',
    plan: ` Subquery Scan on active_users  (cost=5000.00..10000.00 rows=50000 width=36) (actual time=50.000..150.000 rows=50000 loops=1)
    ->  Seq Scan on users_profile  (cost=0.00..5000.00 rows=50000 width=36) (actual time=0.010..100.000 rows=50000 loops=1)
          Filter: (email IS NOT NULL)
          Rows Removed by Filter: 50000
  Planning Time: 0.180 ms
  Execution Time: 155.000 ms`,
  },
  {
    title: 'A7 — Tid Scan (ctid lookup)',
    category: 'SELECT',
    sql: "SELECT * FROM metrics WHERE ctid = '(100,10)';",
    plan: ` Tid Scan on metrics  (cost=0.50..100.00 rows=10 width=24) (actual time=0.050..0.080 rows=10 loops=1)
    TID Cond: (ctid = '(100,10)'::tid)
  Planning Time: 0.060 ms
  Execution Time: 0.100 ms`,
  },
  {
    title: 'A8 — Sample Scan (TABLESAMPLE SYSTEM)',
    category: 'SELECT',
    sql: 'SELECT * FROM logs TABLESAMPLE SYSTEM (1);',
    plan: ` Sample Scan on logs  (cost=0.00..50000.00 rows=10000 width=64) (actual time=0.010..200.000 rows=10000 loops=1)
    Sampling: system ('1'::real)
  Planning Time: 0.100 ms
  Execution Time: 205.000 ms`,
  },
  {
    title: 'A9 — Append (UNION ALL)',
    category: 'SELECT',
    sql: 'SELECT * FROM metrics_2024_q1 UNION ALL SELECT * FROM metrics_2024_q2;',
    plan: ` Append  (cost=0.00..30000.00 rows=100000 width=24) (actual time=0.010..300.000 rows=100000 loops=1)
    ->  Seq Scan on metrics_2024_q1  (cost=0.00..10000.00 rows=50000 width=24) (actual time=0.010..100.000 rows=50000 loops=1)
    ->  Seq Scan on metrics_2024_q2  (cost=0.00..10000.00 rows=50000 width=24) (actual time=0.010..100.000 rows=50000 loops=1)
  Planning Time: 0.300 ms
  Execution Time: 305.000 ms`,
  },
  {
    title: 'A10 — Merge Append (partition-wise ORDER BY)',
    category: 'SELECT',
    sql: 'SELECT * FROM metrics_2024_q1 UNION ALL SELECT * FROM metrics_2024_q2 ORDER BY recorded_at;',
    plan: ` Merge Append  (cost=0.50..25000.00 rows=100000 width=24) (actual time=0.010..400.000 rows=100000 loops=1)
    Sort Key: recorded_at
    ->  Index Scan using idx_metrics_time on metrics_2024_q1  (cost=0.50..5000.00 rows=50000 width=24) (actual time=0.010..100.000 rows=50000 loops=1)
    ->  Index Scan using idx_metrics_time on metrics_2024_q2  (cost=0.50..5000.00 rows=50000 width=24) (actual time=0.010..100.000 rows=50000 loops=1)
  Planning Time: 0.350 ms
  Execution Time: 405.000 ms`,
  },
  {
    title: 'A11 — Unique (DISTINCT via sort)',
    category: 'SELECT',
    sql: 'SELECT DISTINCT metric_name FROM metrics;',
    plan: ` Unique  (cost=50000.00..60000.00 rows=100 width=8) (actual time=500.000..550.000 rows=100 loops=1)
    ->  Sort  (cost=50000.00..55000.00 rows=100000 width=8) (actual time=500.000..520.000 rows=100000 loops=1)
          Sort Key: metric_name
          Sort Method: quicksort  Memory: 8192kB
          ->  Seq Scan on metrics  (cost=0.00..20000.00 rows=100000 width=8) (actual time=0.010..200.000 rows=100000 loops=1)
  Planning Time: 0.200 ms
  Execution Time: 555.000 ms`,
  },
  {
    title: 'A12 — SetOp (EXCEPT)',
    category: 'SELECT',
    sql: 'SELECT id, event_type FROM events EXCEPT SELECT id, event_type FROM events_archive;',
    plan: ` SetOp Except  (cost=10000.00..20000.00 rows=5000 width=12) (actual time=100.000..150.000 rows=5000 loops=1)
    ->  Sort  (cost=10000.00..11000.00 rows=100000 width=12) (actual time=100.000..120.000 rows=100000 loops=1)
          Sort Key: id, event_type
          Sort Method: quicksort  Memory: 8192kB
          ->  Append  (cost=0.00..5000.00 rows=100000 width=12) (actual time=0.010..50.000 rows=100000 loops=1)
                ->  Subquery Scan on "*SELECT* 1"  (cost=0.00..2000.00 rows=50000 width=12) (actual time=0.010..20.000 rows=50000 loops=1)
                      ->  Seq Scan on events  (cost=0.00..1500.00 rows=50000 width=12) (actual time=0.010..15.000 rows=50000 loops=1)
                ->  Subquery Scan on "*SELECT* 2"  (cost=0.00..2000.00 rows=50000 width=12) (actual time=0.010..20.000 rows=50000 loops=1)
                      ->  Seq Scan on events_archive  (cost=0.00..1500.00 rows=50000 width=12) (actual time=0.010..15.000 rows=50000 loops=1)
  Planning Time: 0.500 ms
  Execution Time: 155.000 ms`,
  },
  {
    title: 'A13 — WindowAgg (window function)',
    category: 'SELECT',
    sql: "SELECT metric_name, recorded_at, value, avg(value) OVER (PARTITION BY metric_name ORDER BY recorded_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM metrics WHERE metric_name = 'cpu';",
    plan: ` WindowAgg  (cost=50000.00..100000.00 rows=100000 width=32) (actual time=500.000..2000.000 rows=100000 loops=1)
    ->  Sort  (cost=50000.00..60000.00 rows=100000 width=24) (actual time=500.000..800.000 rows=100000 loops=1)
          Sort Key: recorded_at
          Sort Method: quicksort  Memory: 8192kB
          ->  Index Scan using idx_metrics_name_time on metrics  (cost=0.50..20000.00 rows=100000 width=24) (actual time=0.010..200.000 rows=100000 loops=1)
                Index Cond: (metric_name = 'cpu'::text)
  Planning Time: 0.400 ms
  Execution Time: 2010.000 ms`,
  },
  {
    title: 'A14 — ProjectSet (lateral generate_series)',
    category: 'SELECT',
    sql: 'SELECT u.id, g.value FROM users_profile u, generate_series(1, 10) g(value);',
    plan: ` ProjectSet  (cost=0.00..50000.00 rows=1000000 width=8) (actual time=0.010..500.000 rows=1000000 loops=1)
    ->  Seq Scan on users_profile u  (cost=0.00..3000.00 rows=100000 width=4) (actual time=0.010..20.000 rows=100000 loops=1)
  Planning Time: 0.080 ms
  Execution Time: 505.000 ms`,
  },
  {
    title: 'A15 — Memoize (cached parameterized lookup)',
    category: 'SELECT',
    sql: 'SELECT u.name, (SELECT count(*) FROM events e WHERE e.user_id = u.id) AS event_count FROM users_profile u WHERE u.email IS NOT NULL;',
    plan: ` Seq Scan on users_profile u  (cost=0.00..5000.00 rows=50000 width=36) (actual time=0.010..100.000 rows=50000 loops=1)
    Filter: (email IS NOT NULL)
    Rows Removed by Filter: 50000
    SubPlan 1
      ->  Aggregate  (cost=4.01..4.02 rows=1 width=8) (actual time=0.015..0.015 rows=1 loops=50000)
            ->  Memoize  (cost=0.50..4.00 rows=1 width=0) (actual time=0.010..0.012 rows=5 loops=50000)
                  Cache Key: u.id
                  Hits: 49990  Misses: 10  Evictions: 0  Overflows: 0
                  ->  Index Only Scan using idx_events_user on events e  (cost=0.50..3.99 rows=1 width=0) (actual time=0.010..0.010 rows=5 loops=10)
                        Index Cond: (user_id = u.id)
                        Heap Fetches: 0
  Planning Time: 0.600 ms
  Execution Time: 105.000 ms`,
  },
  {
    title: 'A16 — Incremental Sort (presorted input)',
    category: 'SELECT',
    sql: "SELECT recorded_at, metric_name, avg(value) FROM metrics WHERE recorded_at >= '2024-01-01' GROUP BY recorded_at, metric_name ORDER BY recorded_at, metric_name;",
    plan: ` GroupAggregate  (cost=10000.00..50000.00 rows=50000 width=24) (actual time=100.000..800.000 rows=50000 loops=1)
    Group Key: recorded_at, metric_name
    ->  Incremental Sort  (cost=5000.00..30000.00 rows=50000 width=24) (actual time=50.000..500.000 rows=50000 loops=1)
          Sort Key: recorded_at, metric_name
          Presorted Key: recorded_at
          Sort Method: quicksort  Memory: 4096kB
          ->  Index Scan using idx_metrics_time on metrics  (cost=0.50..15000.00 rows=50000 width=24) (actual time=0.010..200.000 rows=50000 loops=1)
                Index Cond: (recorded_at >= '2024-01-01'::date)
  Planning Time: 0.500 ms
  Execution Time: 810.000 ms`,
  },
  {
    title: 'A17 — Limit (top-N query)',
    category: 'SELECT',
    sql: 'SELECT * FROM metrics ORDER BY recorded_at DESC LIMIT 10;',
    plan: ` Limit  (cost=0.50..1.00 rows=10 width=24) (actual time=0.010..0.080 rows=10 loops=1)
    ->  Index Scan Backward using idx_metrics_time on metrics  (cost=0.50..5000.00 rows=10000 width=24) (actual time=0.010..0.070 rows=10 loops=1)
  Planning Time: 0.080 ms
  Execution Time: 0.100 ms`,
  },
  {
    title: 'A18 — Foreign Scan (FDW)',
    category: 'SELECT',
    sql: 'SELECT * FROM foreign_data.users WHERE active = true;',
    plan: ` Foreign Scan on foreign_data.users  (cost=1000.00..10000.00 rows=50000 width=24) (actual time=100.000..500.000 rows=50000 loops=1)
    Filter: active
  Planning Time: 0.200 ms
  Execution Time: 505.000 ms`,
  },
  {
    title: 'A19 — Custom Scan (Citus distributed)',
    category: 'SELECT',
    sql: "SELECT metric_name, avg(value) FROM metrics WHERE recorded_at >= '2024-01-01' GROUP BY metric_name;",
    plan: ` Custom Scan (Citus Adaptive)  (cost=0.00..0.00 rows=0 width=0) (actual time=500.000..500.000 rows=100 loops=1)
    Task Count: 4
    ->  Distributed Subplan 6_1
          ->  HashAggregate  (cost=50000.00..50100.00 rows=100 width=16) (actual time=500.000..500.000 rows=100 loops=1)
                Group Key: metrics.metric_name
                ->  Seq Scan on metrics_2024_q1 metrics  (cost=0.00..25000.00 rows=500000 width=8) (actual time=0.010..200.000 rows=500000 loops=1)
                      Filter: (recorded_at >= '2024-01-01'::date)
  Planning Time: 2.000 ms
  Execution Time: 510.000 ms`,
  },
  {
    title: 'A20 — Table Function Scan (xmltable)',
    category: 'SELECT',
    sql: "SELECT * FROM xmltable('//person' PASSING '<person><name>Alice</name></person>' COLUMNS name text PATH 'name');",
    plan: ` Table Function Scan on xmltable  (cost=0.00..10.00 rows=100 width=8) (actual time=0.050..0.100 rows=100 loops=1)
  Planning Time: 0.080 ms
  Execution Time: 0.150 ms`,
  },
  {
    title: 'A21 — HashAggregate (GROUP BY without sort)',
    category: 'SELECT',
    sql: 'SELECT metric_name, count(*), avg(value) FROM metrics GROUP BY metric_name;',
    plan: ` HashAggregate  (cost=50000.00..50100.00 rows=100 width=24) (actual time=500.000..500.050 rows=100 loops=1)
    Group Key: metric_name
    Batches: 1  Memory Usage: 4096kB
    ->  Seq Scan on metrics  (cost=0.00..20000.00 rows=1000000 width=16) (actual time=0.010..200.000 rows=1000000 loops=1)
  Planning Time: 0.200 ms
  Execution Time: 505.000 ms`,
  },
];
