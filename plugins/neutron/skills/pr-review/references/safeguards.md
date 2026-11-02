# Safeguard checks

Apply the sections the diff touches. Each has checks for the code and test cases the project's suite should hold. In the report, say which test cases exist and which are missing.

## Permissions and tenant data

- Nested records belong to the caller's account or tenant, not only the top-level record.
- Writable fields are allowlisted, so a client can't set its own role, owner, amount or approval status.
- Callbacks and webhooks are verified for authenticity and replay before they change anything.
- Expensive endpoints (search, exports, reports) have per-caller limits in the application.
- Tests: requests with another account's and another tenant's record, owner and IDs are rejected and disclose nothing; a denied request creates no message, export, reward or partner operation.

## Database changes

- Old code runs on the new schema for the whole rolling deploy; renames and drops happen over several releases (expand, backfill, switch, contract).
- Migrations have a short lock timeout and run as their own deploy step. One that runs outside a transaction must be safe to rerun after a partial failure.
- Deletions preview the exact rows, check tenant scope and cascades, and run in restartable batches.
- Tests: the previous app version passes its smoke tests on the new schema.

## Jobs and external calls

- The work record commits with the data change, and the job is dispatched after the commit, so a crash can't lose it.
- A repeated delivery returns the existing result; exhausted retries end in a visible failed state with an owner.
- Batch size, concurrency, runtime and fan-out to downstream calls are capped.
- Job arguments stay readable by the previous version during a deploy and after a rollback.
- Tests: concurrent and replayed deliveries give one result; crashes before dispatch, after the provider accepts and before completion find the pending work and duplicate nothing; delayed and duplicate callbacks can't repeat an effect or overwrite newer state; a slow, failing or rate-limited provider makes calls time out or back off without hanging a worker or sending twice; a bulk job beside user traffic stays under the provider's limit.

## Money, points and vouchers

- Everything that issues value has caps per customer, per campaign and overall, and a kill switch that works without a deploy. Budget is reserved atomically with issuance.
- Bulk issuance runs as an idempotent, resumable job from a dry run a second person approved; the approved input can't change.
- Tests: running an issuance twice with the same input issues nothing the second time; a job killed halfway and resumed gives every recipient exactly one entry; a retry after a restart returns the first result; the ledger sum equals every cached balance; parallel redemptions with different keys let exactly one claim succeed.

## SMS, OTP and paid calls

- The client IP comes only from the trusted proxy's header. Phone numbers are normalized before rate limiting.
- If the limit store can't be reached, nothing is sent. Resend delays are enforced on the server.
- A drop in the verify rate raises an alert.
- Tests: 100 requests for one number in a minute stay within the limit; a country outside the allowlist is rejected with no provider call; the kill switch stops sends within a minute in staging; concurrent requests can't spend past the reserved budget; a failed or missing bot-check token and a direct backend request never reach the send.
