# How to check common SSAT areas

Map each SSAT item to the areas below by its statement. These are the checks that produce evidence; record the command, file or setting each time.

## Source control and CI

- Read branch rules from the repository, not the docs: required review and checks on `main` and release branches, no direct pushes, no bypass for admins. `gh api repos/<owner>/<repo>/rules/branches/<branch>` shows the rules that apply with read access only; the GitLab equivalent is the protected-branches API. A 403 or 404 means you couldn't check, not that the branch is unprotected.
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
- Security headers, against each public host in scope: `curl -sI https://<host>`. Expect HSTS, X-Content-Type-Options, a Content-Security-Policy (with `frame-ancestors`) or X-Frame-Options, Referrer-Policy, and no server version.
- Rate limits are enforced in the application, not only at the load balancer.

## Sign-in and admin access

- Name the identity provider. Bespoke password or token handling needs a written reason.
- Mobile and browser apps use OAuth with PKCE, not the implicit flow.
- Record the lockout or delay threshold after failed sign-ins (from configuration, or a staging test with a test account).
- Record access and refresh token lifetimes from configuration, and whether a revoked refresh token stops working.
- Password reset: an older reset link stops working once a newer one is issued; links expire within the project's limit (15 minutes is a common bar) and never appear in logged URLs.
- Admin accounts belong to named people, all use MFA, every admin action is in an audit log, and access reviews have a recorded date.

## Secrets and certificates

- Every secret is read from the secrets manager or environment configuration. Search the code and CI configuration for any that aren't.
- Record the rotation schedule and last rotation date for each secret, as far as the configuration shows.
- A certificate-expiry alert fires well ahead of expiry, at least 30 days.
- TLS on each public host in scope: `openssl s_client -connect <host>:443 -tls1_1 </dev/null` should fail to connect (repeat with `-tls1`). For a full list, `nmap --script ssl-enum-ciphers -p 443 <host>`; ask the user before running it, since it is a scan. TLS 1.0, TLS 1.1 and SSL must be absent.

## APIs, input and uploads

- Find where permissions are decided (a module, middleware or policy layer). Check for privilege escalation, missing scope checks and access to another user's records; record the test that proves it, or the gap.
- Sequential IDs are acceptable only when every lookup checks the record's owner.
- Errors return a generic message with no stack trace or internal path.
- Plain HTTP is rejected. Server-to-server callers are restricted by network as well as by credential.
- Validation and permission checks happen on the server. No SQL built from strings; no user input passed to shell commands. CSRF protection on every state-changing request; output encoded wherever user text is rendered.
- Uploads: wrong file types and oversized files are rejected on the server, files are scanned for malware, and downloads go through an authorized endpoint.

## Testing and third parties

- A VAPT by an independent tester covers infrastructure, the application and the API, and every finding is fixed or has a recorded acceptance. Ask for the report; don't infer it.
- Keep an inventory of third-party services: purpose, data sent, how it authenticates. If one becomes unavailable, the system handles it as designed and an alert fires.

## Money, payments and messaging

- Paid calls (SMS, email, other metered APIs) have rate limits, a spend cap and a kill switch. Operations that move value are idempotent. Someone reconciles provider invoices on a schedule.
- No card numbers or CVVs are stored; refunds and reversals are tested; every transaction has an audit trail.
- Only authorized roles can trigger broadcasts. Compare who holds that permission in production with the project's access policy. Test environments send only to test contacts, with separate credentials and a visible test marker.
