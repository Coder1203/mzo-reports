# Database (Supabase)

Login, activity logs, Priority SI works, stock allotments and the Power Map live in Supabase. Report data does not: it comes from Google Sheets or Supabase Storage through the DataHub (see [architecture.md](architecture.md#datahub)).

> Local development talks to the **production** project. Running a migration, import or sync script writes to production. Ask before running one.

## Schemas and tables

| Schema / table | Holds |
|---|---|
| `mzo_insight.portal_users` | Portal login (Username, scrypt-hashed PIN) and every module flag (`nsc_upload_autho`, `si_autho` / `si_divisions`, `sheets_autho`, `stock_*_autho`, `defective_upload_autho`, sync flags, optional `email` for Google sign-in) |
| `mzo_insight.activity_logs` | Portal activity (Admin → Activity) |
| `mzo_insight.prioritySI` | Priority SI works (`si-works/si.html`) |
| `mzo_insight.stock_allotments` | Stock allotment ledger (see [stock.md](stock.md)) |
| `mzo_insight.important_unbilled_months` | Important Sheets unbilled months |
| `public.mzo_power_substations` | Power Map substations and feeders |
| `public.mzo_power_corrections` | Power Map edit suggestions awaiting admin approval |

`mzo_insight` must be listed under Project Settings → API → **Exposed schemas**. After adding a column, run `NOTIFY pgrst, 'reload schema'`.

Production login stays on the old project (`unsmtschmcvftfqwabaq`) until `INSIGHT_LIVE=1`; the new insight project and its cutover are described in [stock.md](stock.md#new-insight-project).

## SQL files (`scripts/sql/`)

Run in the Supabase SQL Editor, in this order for a fresh project:

1. `create_mzo_insight_schema.sql`: schema plus Priority SI tables
2. `create_mzo_insight_portal_users.sql`, then any `alter_portal_users_*.sql` the table is missing (each adds one module flag)
3. `create_mzo_insight_activity_logs.sql`
4. `create_important_unbilled_months.sql`
5. `create_mzo_power_map_tables.sql`
6. Stock: `create_mzo_insight_stock_snapshot.sql`, `create_mzo_insight_stock_allotments.sql`, `alter_stock_allotments_cancel.sql`, `alter_stock_snapshot_add_category.sql`, `create_stock_storage_policies.sql`

`create_insight_project_gmasnqeb.sql` creates everything above in an empty project. Clean-up scripts: `drop_si_user_access.sql` (old SI PIN table), `drop_mzo_insight_nsc_tables.sql` (NSC no longer stores rows in Supabase; keep the `nsc_upload_autho` flag). `import_stock_*.sql` are generated one-off imports.

## One-time imports (`scripts/migrate/`)

| Command | Does |
|---|---|
| `npm run migrate:portal-users` | Imports users from the old Google Sheet (`FORCE=1` wipes and re-imports) |
| `npm run migrate:activity-logs` | Imports old Google activity logs |
| `npm run migrate:power-map` | Imports the Power Map sheet into `mzo_power_*` tables |
| `npm run copy:insight` | Copies users, logs, unbilled months, allotments and the stock snapshot into the new insight project without switching production |

These were run once during past migrations; they are kept for rebuilding a project.

## Login rules

- PINs are stored as `scrypt$` hashes. A still-plain PIN is accepted once and then replaced with its hash. `GET /api/admin/users` never returns `PIN`; a blank PIN on update keeps the current one.
- Google sign-in verifies the ID token with Google (audience = `GOOGLE_CLIENT_ID`, issuer, expiry, verified email) and signs in the portal user whose `email` equals the token's email exactly. An email no user has registers a new account with `user_status = pending` until an admin approves it (root-admin emails are provisioned directly). Existing PIN users are linked to Google by an admin setting their email in User Management; there is no match on the part before the @.
- After an admin changes a module flag, the user signs in again so the stored profile refreshes.
- Power Map tables and Priority SI data are untouched by the login import.
