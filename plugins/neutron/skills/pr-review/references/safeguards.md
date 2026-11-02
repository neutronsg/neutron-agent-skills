# Safeguard checks

Apply the sections the diff touches. Each has checks for the code and test cases the project's suite should hold. In the report, say which test cases exist and which are missing.

## Permissions and tenant data

- Nested records belong to the caller's account or tenant, not only the top-level record.
- Writable fields are allowlisted, so a client can't set its own role, owner, amount or approval status.
- Callbacks and webhooks are verified for authenticity and replay before they change anything.
- Expensive endpoints (search, exports, reports) have per-caller limits in the application.
- Tests: requests with another account's and another tenant's record, owner and IDs are rejected and disclose nothing; a denied request creates no message, export, reward or partner operation.

## Database changes

- Old code runs on the new schema for the whole rolling deploy. A rename or drop takes several releases: expand, switch and contract each ship in their own release, with the backfill between expand and switch.
- Backfills run in resumable batches and never overwrite a value written since they started. After the switch, the code keeps writing the old column while a rollback is still possible.
- Migrations have a short lock timeout and run as their own deploy step. One that runs outside a transaction must be safe to rerun after a partial failure.
- Deletions preview the exact rows and count, including related rows, files and queued work; check tenant scope and cascades; name the recovery point they can be restored from; and run in restartable batches that stop on an unexpected count.
- Tests: the previous app version passes its smoke tests on the new schema.

## Jobs and external calls

- The work record commits with the data change, and the job is dispatched after the commit, so a crash can't lose it.
- Each operation has a stable identity, not the queue's attempt ID. A repeated delivery returns the existing result; the same identity with different input is rejected.
- After an external timeout, the job looks up the result under the original reference. If the service can't say, the work stays unresolved for reconciliation rather than starting a new operation.
- Retries are capped with backoff, and exhausted work ends in a visible failed state that keeps its identity and has an owner.
- Result size, batch size, concurrency, runtime and fan-out to downstream calls are capped. Large exports run as jobs and stream their data, scoped to the requesting user and tenant.
- Job arguments stay readable by the previous version during a deploy and after a rollback.
- Tests: concurrent and replayed deliveries give one result; crashes before dispatch, after the provider accepts and before completion find the pending work and duplicate nothing; delayed and duplicate callbacks can't repeat an effect or overwrite newer state; a slow, failing or rate-limited provider makes calls time out or back off without hanging a worker or sending twice; a bulk job beside user traffic stays under the provider's limit; the largest allowed export stays within memory and queue limits, and one over the limit is rejected.

## Money, points and vouchers

- Amounts are integer minor units or a fixed-point decimal, never floating point, from the database to the API and exports.
- The server decides ownership, eligibility, amounts and prices. The client sends intent, never values.
- Every change in value is a new ledger entry. A correction is a new entry pointing to the original, never an edit. A cached balance changes in the same transaction as its entry.
- Every operation that moves value has an idempotency key, stored with a unique constraint, so a replay returns the first result.
- One-time and per-customer limits are enforced by the database (a unique constraint or a conditional update), never by checking in code and then writing.
- Everything that issues value has caps per customer, per campaign and overall, and a kill switch that works without a deploy. Budget is reserved atomically with issuance. A new campaign has a budget cap and an end date.
- Redemption codes are random and long enough that they can't be guessed or enumerated, and failed attempts are limited per account as well as per IP.
- Bulk issuance runs as an idempotent, resumable job from a dry run a second person approved; the approved input can't change.
- Tests: running an issuance twice with the same input issues nothing the second time; a job killed halfway and resumed gives every recipient exactly one entry; a retry after a restart returns the first result; the ledger sum equals every cached balance; parallel redemptions with different keys let exactly one claim succeed.

## SMS, OTP and paid calls

- A bot check is verified on the server before a public send.
- Rate limits cover every axis: per phone number, IP, device and account, plus a global ceiling per minute and per day. The client IP comes only from the trusted proxy's header, and phone numbers are normalized before limiting.
- The country comes from the parsed number, and only countries the product serves reach the provider.
- Budget is reserved before the call. A send with an unknown outcome keeps its reservation until it's resolved.
- If the limit store can't be reached, nothing is sent. Resend delays are enforced on the server.
- The response is the same whether or not the number or account exists, so the endpoint can't be used to find accounts.
- A drop in the verify rate (verified codes divided by sent codes) raises an alert.
- Other paid APIs (email, lookups, AI calls) get the same limits per caller and overall, a spend ceiling and a kill switch.
- Tests: 100 requests for one number in a minute stay within the limit; a country outside the allowlist is rejected with no provider call; the kill switch stops sends within a minute in staging; concurrent requests can't spend past the reserved budget; a failed or missing bot-check token and a direct backend request never reach the send; a synthetic drop in the verify rate fires the alert.
