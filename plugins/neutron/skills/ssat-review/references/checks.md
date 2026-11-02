# How to check common SSAT areas

Map each SSAT item to the areas below by its statement. These are the checks that produce evidence; record the command, file or setting each time.

## Source control and CI

- Read branch rules from the repository, not the docs: required review and checks on `main` and release branches, no direct pushes, no bypass for admins. Check both mechanisms GitHub has, and every page of each:
  - Rulesets: `gh api --paginate repos/<owner>/<repo>/rulesets`, then `gh api repos/<owner>/<repo>/rulesets/<id>` for each one that targets the branch. Its `bypass_actors` must be empty, or name only the roles the project allows.
  - Classic protection: `gh api repos/<owner>/<repo>/branches/<branch>/protection`. `enforce_admins.enabled` must be true.
  - `gh api repos/<owner>/<repo>/rules/branches/<branch>` shows which rules apply, but not who can bypass them.
  - On GitLab, read the protected-branches API and the project's approval rules.
  - Bypass lists and classic protection need admin access. A 403 or 404 means you couldn't check, not that the branch is unprotected: mark the line as needing evidence.
- Every PR merged since the previous SSAT (ask for its date) had an AI review run and a human approval. List them with `gh pr list --state merged --search "merged:>=<date>" --limit 500 --json number,reviews,mergedAt` and page further if the list hits its limit.
- SAST, dependency scanning and secret scanning run on every PR and fail it on a serious finding. A report-only scan is a gap. Find the workflow file and a recent run that shows it.
- New or upgraded dependencies are checked before merge.

## Personal data

- List every personal-data field the system stores, with why it is collected. Fields without a reason are a gap.
- Confirm encryption in transit and at rest from the database and storage settings, not from a default you assume.
- Test endpoints that return personal data with two accounts: one must never see the other's records.
- Search logs, error reports and fixtures for personal data. If the user can trigger an error with synthetic data in staging, check the error report shows it redacted or not at all.
- Record where data and backups are stored, including third-party processors, and compare with the region the project requires.

## Network and internet exposure

- The database and internal services can't be reached from the internet. Read the firewall or security-group rules; the default should be deny. Record the date of the last rule review; no date is a gap.
- Every public endpoint, APIs included, sits behind the web application firewall and DDoS protection the project uses.
- Security headers, against each public host in scope: `curl -sI https://<host>`. Expect HSTS, X-Content-Type-Options, a Content-Security-Policy, framing blocked by its `frame-ancestors` or by X-Frame-Options, Referrer-Policy, and no server version. A missing CSP is a gap even when X-Frame-Options is set.
- Rate limits are enforced in the application, not only at the load balancer.

## Sign-in and admin access

- Name the identity provider. Bespoke password or token handling needs a written reason.
- Mobile and browser apps use OAuth with PKCE, not the implicit flow.
- Record the lockout or delay threshold after failed sign-ins (from configuration, or a staging test with a test account).
- Record access and refresh token lifetimes from configuration, and whether a revoked refresh token stops working.
- Password reset: an older reset link stops working once a newer one is issued; links expire within 15 minutes, or the stricter limit the SSAT item states, and never appear in logged URLs.
- Admin accounts belong to named people, all use MFA, every admin action is in an audit log, and access reviews have a recorded date.

## Secrets and certificates

- Every secret comes from the vault or secrets manager, read directly or injected into the environment at deploy. A value written into a config file, image, CI file or deploy script is a gap. Search the code and CI configuration for any.
- Record the rotation schedule and last rotation date for each secret, as far as the configuration shows.
- A certificate-expiry alert fires well ahead of expiry, at least 30 days.
- TLS on each public host in scope: TLS 1.0, TLS 1.1 and SSL must be absent. The evidence is `nmap --script ssl-enum-ciphers -p 443 <host>`, which lists every protocol the server accepts. Ask the user before running it, since it is a scan.
  - Without `nmap`, don't infer the answer from a failed `openssl s_client -tls1_1`. Current OpenSSL builds refuse to offer TLS 1.0 and 1.1 themselves, so the command fails against every server ("no protocols available"). Mark the line as needing evidence instead.

## APIs, input and uploads

- Find where permissions are decided (a module, middleware or policy layer). Check for privilege escalation, missing scope checks and access to another user's records; record the test that proves it, or the gap.
- Sequential IDs are acceptable only when every lookup checks the record's owner.
- Errors return a generic message with no stack trace or internal path.
- Plain HTTP is rejected. Server-to-server callers are restricted by network as well as by credential.
- Validation and permission checks happen on the server. No SQL built from strings; no user input passed to shell commands. CSRF protection on every state-changing request; output encoded wherever user text is rendered.
- Uploads: wrong file types and oversized files are rejected on the server, files are scanned for malware, and downloads go through an authorized endpoint.

## Testing and third parties

- A VAPT by an independent, accredited vendor covers infrastructure, the application and the API, and every finding is fixed or has a recorded acceptance. Ask for the report and the vendor's accreditation; don't infer either.
- Keep an inventory of third-party services: purpose, data sent, how it authenticates. If one becomes unavailable, the system handles it as designed and an alert fires.

## Money, payments and messaging

- Paid calls (SMS, email, other metered APIs) have rate limits, a spend cap and a kill switch. Operations that move value are idempotent. Someone reconciles provider invoices on a schedule.
- No card numbers or CVVs are stored; refunds and reversals are tested; every transaction has an audit trail.
- Only authorized roles can trigger broadcasts. Compare who holds that permission in production with the project's access policy. Test environments send only to test contacts, with separate credentials and sender IDs, and a test marker such as a `[UAT]` prefix on every message.
