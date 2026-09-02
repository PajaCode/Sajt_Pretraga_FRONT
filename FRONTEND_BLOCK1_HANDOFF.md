# FRONTEND BLOCK 1 — HANDOFF

Scope: Angular frontend (`sajt-pretraga-front`) hardening + new package-purchase flow, plus one approved backend migration for a data-integrity blocker found during audit. No commits made (per instruction).

---

## 0. BACKEND BLOCKER — DUPLICATE JMBG (approved fix)

**New file:** `Sajt_Pretraga_API/020_alter_mr_complete_purchase_jmbg_uniqueness.sql`

- `CREATE OR ALTER PROCEDURE dbo.MR_CompletePurchase`, body based byte-for-byte on `019_alter_mr_complete_purchase_activation_guard.sql` (re-read immediately before editing, per instruction).
- Only change: one new guard inserted after the existing JMBG/DatumRodjenja null checks, before the ActivePackage check:
  ```sql
  IF EXISTS (
      SELECT 1 FROM dbo.PortalUsers
      WHERE JMBG = @JMBG AND Id <> @PortalUserId
  )
  BEGIN
      ROLLBACK TRANSACTION;
      THROW 50072, N'Korisnik sa ovim JMBG vec postoji.', 1;
  END
  ```
  New error code `50072` (no collision with existing 50030/50031/50032/50033/50070/50071).
- All other 019 logic preserved verbatim: ownership check (THROW 50033), idempotency on `Status='Completed'`, `Status<>'Paid'` guard (THROW 50031), JMBG/DatumRodjenja required checks (THROW 50070/50071), ActivePackage guard (THROW 50032), sequence-based BrPolise/BrKartice generation, DZO_Kartice insert, PortalUsers update, DZO_IskoriscenostPoPaketu/Podpokricu inserts, MR_UserAccountState update, MR_PaymentTransaction completion, audit logging, `@ActivationStarted`-gated CATCH behavior.
- Migrations 001–019 untouched. 020 is purely additive.

**Applied to a live database:** ❌ **NOT RUN.** No SQL Server instance is reachable from this machine (confirmed again this session — no SQL engine service registered, only `SQLWriter`). This has **not blocked** the rest of the frontend work, per instruction.

**Action required from you (run in SSMS against SajtServisi):**

1. Duplicate check:
   ```sql
   SELECT JMBG, COUNT(*) AS Broj
   FROM dbo.PortalUsers
   WHERE NULLIF(LTRIM(RTRIM(JMBG)), '') IS NOT NULL
   GROUP BY JMBG
   HAVING COUNT(*) > 1;
   ```
   - If **0 rows**: no historical duplicates. A future UNIQUE constraint would be *possible* later, but was **not added now** (no need demonstrated) — consistent with instruction #5.
   - If **> 0 rows**: do **not** touch/delete those rows. Just note the count; the new guard only prevents *new* collisions going forward. Only act on historical rows if they cause a concrete problem later.
2. Apply `020_...sql` against SajtServisi.
3. Test: User A completes purchase with JMBG X → succeeds. User B (different PortalUserId) attempts JMBG X → rejected with the 50072 message (surfaces to the frontend as a generic HTTP 500 "Doslo je do greske." — see §6 below, this is pre-existing `ApiExceptionMiddleware` behavior, not new). User A retrying/idempotent completion still works. Confirm User B's rejected attempt did not alter User A's account/payment state.
4. Report back pass/fail — until then, treat 020 as **NOT VERIFIED**, only *written and reviewed*.

Once you confirm 020 is applied and tested, backend is CLOSED again — no further backend audit planned for this block.

---

## 1. IMPLEMENTED (frontend)

### A) `JwtInterceptor.allowedDomains` fix
`src/app/app.module.ts` — `allowedDomains` is now derived from `new URL(environment.baseApiUrl).host` (hostname[:port], no path) instead of a hardcoded broken list. Whichever `baseApiUrl` is active in `environment.ts` is automatically the correct interceptor target.
**Live Bearer-token smoke test against local API: NOT RUN** — no reachable local backend/DB this session (same root cause as §0). Verified statically only: `JwtInterceptor` is registered, `tokenGetter` reads `localStorage['user-token']`, and `allowedDomains` now matches the real API host string exactly (confirmed via `new URL()` parsing, not guessed).

### B) `/paketi` semantic mismatch
Did **not** repurpose the existing "current coverage" screen. Existing `paketi` module/component/route are untouched and still show current coverage (JMBG-keyed `DzoService` calls). Built a **separate** module/route/component for purchasing:
- `src/app/shared/modules/kupovina-paketa/` (module + routing module, same "lazy module for code-splitting, component declared in AppModule" pattern used by `paketi`).
- `src/app/components/portali/kupovina-paketa/` (component, template, styles).
- Route: `/kupovina-paketa`, guarded by `AuthGuard` only (not `ActivePackageGuard` — a user without a package must be able to reach it).

### C) Reset-password console leak
`src/app/components/reset-password/reset-password.component.ts` — removed `console.log(resetPasswordModel)` (was logging the plaintext new password).

### D) Real guards
- `src/app/shared/guards/auth.guard.ts` — rewritten from a no-op `return true` stub into a real guard: waits on `CurrentUserService.ensureLoaded()`, requires both a loaded user *and* `authService.isLoggedIn()`, else clears tokens and redirects to `/login` via `router.createUrlTree` (no double-navigation).
- `src/app/shared/guards/active-package.guard.ts` — new. Waits on `ensureLoaded()`; allows through only if `user.hasActivePackage`; no user → `/login`; user without package → toast + redirect to `/paketi`.
- Both guards wait for `ensureLoaded()` rather than reading a possibly-stale snapshot, so a hard browser refresh doesn't race the guard against the `/me` call.
- `src/app/app.component.ts` — kicks off `currentUserService.ensureLoaded().subscribe()` on app bootstrap so the cache is warm as early as possible.

---

## 2. CURRENT-USER STATE

- `src/app/shared/services/current-user.service.ts` — `BehaviorSubject<CurrentUser | null | undefined>` with `undefined` as "not yet loaded" sentinel (distinct from `null` = "loaded, logged out/failed"). `ensureLoaded()` returns the cached value if already resolved, otherwise fetches. `refresh()` always re-fetches (used post-purchase). `clear()` for logout.
- `src/app/shared/services/master.service.ts` — thin wrapper over `GET Master/me`, `GET Master/packages`, `POST Master/payment/initiate`, `POST Master/payment/confirm-mock`, `POST Master/purchase/complete`, all returning `ApiResponse<T>`.
- `src/app/shared/models/current-user.ts`, `api-response.ts`, `master.ts` — TypeScript interfaces matching backend DTOs field-for-field, camelCase names manually verified against System.Text.Json's default naming policy (confirmed no custom `JsonOptions` in `Program.cs`; acronym runs like `JMBG` fully lowercase to `jmbg`), not guessed.

---

## 3. NAVBAR / MENU

`src/app/components/header/header.component.ts` now injects `CurrentUserService`, subscribes to `user$`, and drives `hasActivePackage`. Logged-in users without an active package see only a "Kupovina paketa" link instead of the full menu (which requires an active package). Reactive: updates live once `refresh()` resolves post-purchase, no manual reload needed.

---

## 4. PACKAGE PURCHASE FLOW (new)

`src/app/components/portali/kupovina-paketa/kupovina-paketa.component.ts` — 3-step flow, no persisted "resume" state:

1. **select** — `GET Master/packages` on init; redirects away with a toast if the user already has an active package (checked from the `CurrentUserService` snapshot, cheap since it's already loaded by the guard).
2. **payment** — `POST Master/payment/initiate` (sends only `{ paketId }`, never `PortalUserId` — identity comes from the JWT server-side). Two mock buttons call `POST Master/payment/confirm-mock`.
3. **complete** — form (ime/prezime/jmbg/datumRodjenja, JMBG validated client-side with `/^\d{13}$/` in addition to the server-side check) → `POST Master/purchase/complete` → on success, `currentUserService.refresh()` before navigating to `/paketi`, so the navbar/guards see the new state immediately.

Double-submit prevention: `loadingPayment`/`loadingComplete` flags disable buttons and short-circuit handler re-entry on all three steps.

Verified against `007_create_mr_procedures_payment.sql` that this "always restart at selection, no resume" design is backend-safe: `MR_CreatePaymentTransaction` only blocks re-initiation when `AccountStatus = 'ActivePackage'` (THROW 50011); `PendingPayment`/`PaymentFailed`/`ActiveNoPackage` can always start a fresh transaction.

---

## 5. LEGACY TRUSTED-IDENTITY CLEANUP

- `src/app/shared/services/api.service.ts` — `istorijaUput()` no longer takes/sends `IdPortal`; backend `DZO_PrikaziZahteve` is `[Authorize]` and already derives identity from the JWT server-side, so the frontend-supplied id was stale/unused trust surface.
- `src/app/components/portali/forma/forma.component.ts` — updated the one caller accordingly.
- `src/app/shared/interceptors/token.interceptor.ts` — deleted (dead code, fully replaced by `ApiErrorInterceptor` in providers; confirmed no remaining references via repo-wide grep).

---

## 6. UNIFIED API ERROR HANDLING

New `src/app/shared/interceptors/api-error.interceptor.ts`:
- **401** → clear tokens + current-user cache, toast, redirect to `/login` (unless already there).
- **403** → friendly "no permission" toast.
- **400** → shows `error.error?.message` from the `ApiResponse` envelope.
- **0 / network error** → "server unavailable" toast.
- **default (incl. 500)** → generic message, or `error.error?.message` if present.

Known, documented limitation (not a bug, not in scope to fix): `ApiExceptionMiddleware` in the backend converts **all** unhandled exceptions — including business-rule `THROW`s from stored procedures (JMBG collision, ActivePackage guard, ownership checks, etc.) — into a generic HTTP 500 with `"Doslo je do greske."`. This is pre-existing backend behavior, confirmed by reading the middleware. The frontend interceptor's default-case handling already degrades gracefully for this (generic toast), but users will not get a precise "this JMBG is already registered" message from a 500 in production the way they would from a proper 400. Flagged here for future backend work, out of the approved 020-only scope for this block.

---

## 7. ACCOUNT-STATUS COVERAGE

Real `MR_UserAccountState.AccountStatus` values found across the backend (grepped all migrations): `EmailPending`, `ActiveNoPackage`, `PendingPayment`, `PaymentFailed`, `ActivePackage`, `Expired`. `Blocked` does not exist anywhere in the backend, so no UI was built for it (would've been speculative).
`EmailPending` needs no special purchase-flow handling: login already requires `PortalUsers.Aktivan = 1`, which is only set after email confirmation, so a logged-in user reaching `/kupovina-paketa` can never be `EmailPending` in practice.

---

## 8. NPM AUDIT

Per instruction: **no** `npm audit fix --force`, **no** Angular major-version upgrade attempted this block.

- Almost all critical/high findings are **dev-only build tooling** (Angular CLI / `@angular-devkit/build-angular` / webpack-dev-middleware / `tar` / `websocket-driver` / `ws` chain) — not shipped to production, not runtime risk.
- Remaining **high** findings that *are* runtime packages (`@angular/*` core, `@ng-bootstrap/ng-bootstrap`, `ngx-cookie-service`, `ngx-spinner`, `primeng`) are fixable only via a major-version bump. **Recorded as security debt, not fixed** — requires a dedicated upgrade block due to breaking-change risk.

---

## 9. BUILD

```
npm run build
```
**Result: ✅ PASS — 0 errors**, production build completed (`ng build`), all new/modified modules (including the new lazy `kupovina-paketa` chunk, 8.16 kB) compiled and bundled successfully. Only pre-existing CSS selector warnings unrelated to this work (`.form-floating>~label`, `legend+*` — PrimeNG/Bootstrap SCSS, not touched this block).

---

## 10. FILES CHANGED

**New:**
- `Sajt_Pretraga_API/020_alter_mr_complete_purchase_jmbg_uniqueness.sql`
- `src/app/shared/models/current-user.ts`
- `src/app/shared/models/api-response.ts`
- `src/app/shared/models/master.ts`
- `src/app/shared/services/master.service.ts`
- `src/app/shared/services/current-user.service.ts`
- `src/app/shared/guards/active-package.guard.ts`
- `src/app/shared/interceptors/api-error.interceptor.ts`
- `src/app/shared/modules/kupovina-paketa/kupovina-paketa-routing.module.ts`
- `src/app/shared/modules/kupovina-paketa/kupovina-paketa.module.ts`
- `src/app/components/portali/kupovina-paketa/kupovina-paketa.component.ts`
- `src/app/components/portali/kupovina-paketa/kupovina-paketa.component.html`
- `src/app/components/portali/kupovina-paketa/kupovina-paketa.component.scss`
- `FRONTEND_BLOCK1_HANDOFF.md` (this file)

**Modified:**
- `src/app/app.module.ts`
- `src/app/app.component.ts`
- `src/app/app-routing.module.ts`
- `src/app/shared/services/api.service.ts`
- `src/app/shared/guards/auth.guard.ts`
- `src/app/components/header/header.component.ts`
- `src/app/components/portali/forma/forma.component.ts`
- `src/app/components/reset-password/reset-password.component.ts`

**Deleted:**
- `src/app/shared/interceptors/token.interceptor.ts`

No commits created — all changes are working-tree only, per instruction.

---

## 11. FINAL DECISION

| Item | Status |
|---|---|
| Migration 020 written per constraints | ✅ PASS |
| Migration 020 applied to live DB | ❌ NOT RUN (no reachable SQL Server — action required from you) |
| Migration 020 User A/B test | ❌ NOT RUN (depends on above) |
| JwtInterceptor fix | ✅ PASS (static verification) |
| Live Bearer-token smoke test | ❌ NOT RUN (no reachable local backend) |
| `/paketi` mismatch fix | ✅ PASS |
| Reset-password console leak fix | ✅ PASS |
| Real Auth/ActivePackage guards | ✅ PASS |
| Current-user state service | ✅ PASS |
| Navbar/menu lock-unlock | ✅ PASS |
| Package purchase flow (list/pay/mock/complete/refresh) | ✅ PASS |
| Legacy trusted-identity cleanup | ✅ PASS |
| Unified API error handling | ✅ PASS |
| Double-submit prevention (purchase flow) | ✅ PASS |
| `npm run build` 0 errors | ✅ PASS |
| npm audit — no force fix, no major upgrade, debt documented | ✅ PASS |
| Commit created | ❌ NOT DONE (per instruction — none created) |

**Overall FRONTEND BLOCK 1: CONDITIONAL PASS.**
All frontend code changes are complete and build cleanly. The two items still marked NOT RUN (migration 020 applied+tested, live Bearer-token browser smoke test) are both blocked purely by the lack of a reachable SQL Server / running local backend in this environment, not by any known defect — they require your action in SSMS / a local dev run. Block should not be marked fully DONE until you confirm those two results.
