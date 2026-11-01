# scripts

Node, SQL and Python tooling run by hand from the repo root. None of it is served or loaded by the app.

> These scripts talk to the **production** Supabase project and Google Sheets. Anything that syncs, imports, copies or repairs writes to production. Ask the owner before running one.

| Folder | What | How to run |
|---|---|---|
| `sql/` | Schema and migration SQL for the Supabase SQL Editor | Paste into the editor; order and purpose in [docs/database.md](../docs/database.md) |
| `sync/` | Mirror a published Google Sheet into Supabase Storage plus a small `meta.json` (the same job the in-app **Sync sheet** buttons run on the server) | `npm run sync:disconnection`, `sync:defective`, `sync:pending-mc`, `sync:load-ext` (load `.env`) |
| `migrate/` | One-off imports and repairs from past migrations, kept for rebuilding a project | `npm run migrate:portal-users`, `migrate:activity-logs`, `migrate:power-map`, `copy:insight`; the rest with `node scripts/migrate/<file>` |
| `tools/` | Generators | see below |

## sync/

`common.js` holds the shared plumbing (fetch the published CSV, upload to Storage, write meta). Each `sync_*.js` adds the report's own summary numbers. Credentials come from env (`SUPABASE_*` / `INSIGHT_*`) or the git-ignored `data/supabase_config.json` (template: `supabase_config.example.json` in this folder).

## migrate/

| File | Does |
|---|---|
| `import_portal_users_from_sheet.js` | Old Google Sheet users → `mzo_insight.portal_users` (`FORCE=1` wipes first) |
| `import_activity_logs_from_google.js` | Old Apps Script activity logs → `mzo_insight.activity_logs` |
| `import_mzo_power_map_from_sheet.js` | Power Map sheet → `mzo_power_substations` |
| `copy_insight_to_new_supabase.js` | Old project's `mzo_insight` rows and stock snapshot → new insight project |
| `migrate_stock_sheet_to_supabase.js` | Google Sheet stock dump → `mzo_insight.stock_snapshot` |
| `generate_stock_snapshot_import_sql.js`, `generate_stock_allotments_import_sql.js` | Write the `sql/import_stock_*.sql` files |
| `repair_stock_allotment_dates.js` | Backfill blank `stock_allotments.date` from `created_at` |

## tools/

| File | Does |
|---|---|
| `generate_stock_material_category.js` (`npm run tools:stock-categories`) | Rebuilds `lib/stock_material_category.js` and `stock/stock_material_category.js` from the Local/Central material sheet |
| `compute_briefing_cccs.js` (`npm run tools:briefing-cccs`) | Adds per-division CCC hotspots to the local `data/*_meta.json` files |
| `generate_mzo_icons.py` | Draws the PWA icons in `icons/` (needs Pillow) |
