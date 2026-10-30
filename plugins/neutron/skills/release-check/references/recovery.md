# How each kind of change is undone

A code rollback doesn't undo migrations, data changes, sent messages or payments, and an installed mobile build can't be recalled. Plan each one before deploying.

| Change | How it is undone | What stays behind |
|---|---|---|
| Backend code | Redeploy the previous artifact. | Jobs queued by the new version may fail on the old code; pause or drain them first. |
| Behaviour behind a flag | Turn the flag off; no deploy needed. | Data written while it was on. |
| Schema | Keep additive changes when rolling code back; old code must still run on the new schema. | Dropped or rewritten data: a down migration won't bring it back. |
| Data change or backfill | A repair script, tested on a copy. For points or balances, new correcting ledger entries, never edits. | Changed rows and their external effects. |
| Messages, payments, partner orders | Not reversible by rollback. Establish each outcome, then cancel or compensate where the provider allows. | Effects that are done, pending or unknown. Provider acceptance is not the customer outcome. |
| Mobile build | Can't be recalled. Switch the feature off on the server, or ship a new build through store review. | Installed builds keep calling the API until users update. |

If a change can only be fixed forward, say how it would be contained before deploying, such as switching the feature off or pausing new work.
