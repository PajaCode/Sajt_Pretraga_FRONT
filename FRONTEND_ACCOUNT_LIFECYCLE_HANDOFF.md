# ACCOUNT LIFECYCLE — Forgot/Reset Password — HANDOFF

Scope: secure Master forgot/reset password flow (backend + frontend), plus
two small existing-bug fixes. Legacy `DbController`/`DbManager`
`ProveraForgottenPass`, `Portal_ProveraForgottenPassword`,
`Portal_ResetForgottenPassword`, legacy `EmailManager.cs` — untouched. No
commits made (per instruction).

---

## 1. BACKEND

**New migration** `Sajt_Pretraga_API/021_create_mr_password_reset.sql`:
- `dbo.MR_PasswordResetToken` (`Id, PortalUserId, Jti, ExpiresAt, UsedAt, CreatedAt`), unique index on `Jti`.
- `dbo.MR_CreatePasswordResetToken` — looks up `PortalUsers` by `Email` where `Aktivan = 1`; invalidates any prior unused token for that user before inserting the new one (single-use, only the latest reset email is valid); leaves `@PortalUserId OUTPUT` NULL if the account doesn't exist/isn't active (no enumeration oracle, no error).
- `dbo.MR_ResetPassword` — requires a matching token row with `UsedAt IS NULL AND ExpiresAt > SYSUTCDATETIME()`; updates `PortalUsers.Password` and marks the token used, atomically; `@Success OUTPUT = 0` for any expected rejection (no 500).
- **Bug found and fixed in this same migration** (not a separate migration — 021 wasn't final yet): the password hash originally used `HASHBYTES('SHA2_512', @NewPassword)` directly. The existing `Portal_UserLogin` (`@Password VARCHAR(50)`) and `MR_RegisterUser` (`HASHBYTES('SHA2_512', CONVERT(VARCHAR(50), @Password))`) both hash over VARCHAR-encoded bytes; the new procedure was missing that `CONVERT`, so a reset password produced a hash that could never match on login. Fixed to `HASHBYTES('SHA2_512', CONVERT(VARCHAR(50), @NewPassword))`, matching the existing pattern exactly. Verified this was a pure SQL-text gap, not a C#/Dapper difference — `RegistrationService.cs` and `PasswordResetService.cs` build their `DynamicParameters` identically.

**`Helpers/TokenGenerator.cs`** — `GenerisiPasswordResetToken(portalUserId, jti)` (10-minute JWT, claims `PortalUserId`/`purpose=PasswordReset`/`jti`, same `JwtSettings` signing key/issuer/audience as the rest of the app) and `ValidatePasswordResetToken(token)` (full `TokenValidationParameters` check + `purpose == PasswordReset` + valid `PortalUserId`/`jti`). A login JWT or activation token fails this validation.

**`Models/Master/PasswordResetDtos.cs`**, **`Models/Master/FrontendSettings.cs`** — new DTOs / `PasswordResetBaseUrl` config.

**`Services/IPasswordResetService.cs` / `PasswordResetService.cs`** — `ForgotPasswordAsync` / `ResetPasswordAsync`, mirrors `RegistrationService.cs`'s Dapper conventions.

**`Services/IEmailService.cs` / `EmailService.cs`** — added `SendPasswordResetEmailAsync`, builds the link from `FrontendSettings:PasswordResetBaseUrl` + `/{token}`. Never throws (same convention as siblings).

**`Controllers/MasterController.cs`**:
- `POST forgot-password` — always returns the same generic message regardless of account existence: *"Ako nalog sa unetom email adresom postoji, instrukcije za promenu lozinke su poslate."* Raw token never in the response.
- `POST reset-password` — validates `NewPassword` length **6–50** (upper bound added to match `Portal_UserLogin`'s real `VARCHAR(50)` contract — passwords longer than 50 chars were previously accepted by validation but silently truncated by `CONVERT(VARCHAR(50), ...)` at hash time, which would have been a second way to end up with a hash that never matches). Expected token rejection (invalid/expired/reused/wrong purpose) returns a controlled `400 INVALID_RESET_TOKEN`, never 500.

**`appsettings.Development.json`** → `FrontendSettings:PasswordResetBaseUrl = http://localhost:4200/reset-password`.
**`appsettings.production.json`** → existing prod URL (unchanged from legacy).

**Fix — `Middleware/ApiExceptionMiddleware.cs`**: fallback `ApiResponse<object>` now serialized with explicit camelCase `JsonSerializerOptions`, matching normal controller responses (was PascalCase, a pre-existing bug unrelated to this feature but touched because reset-token error responses go through this path).

**Fix — `Managers/AuthManager.cs` (`Login`)**: reject when `Status != 1` (was `Status == 0` only), so an inactive/unconfirmed account (`Status == 2`) no longer receives a real signed JWT in the response body.

---

## 2. FRONTEND

- `shared/models/master.ts` — `ForgotPasswordRequest`, `ResetPasswordRequest` (+ result types).
- `shared/services/master.service.ts` — `forgotPassword()` / `resetPassword()`.
- `components/login-register/login-register.component.ts` — existing forgot-password modal (`posaljiMail()`) rewired from legacy `EmailService` to `MasterService.forgotPassword()`.
- `components/reset-password/reset-password.component.ts` (+ `.html`) — rewritten: token held only in a component field (memory only, never decoded/logged/stored), `email` field dropped, `newPassword`/`repeatedNewPassword` with a match validator, submits to `MasterService.resetPassword({ token, newPassword })`.

---

## 3. MANUAL SMOKE TEST (real run against dev Mailpit + dev SQL Server, throwaway test account, this session)

All items PASS:

| Item | Result |
|---|---|
| forgot-password returns identical generic message for existing vs. nonexistent email | PASS |
| reset email link points to `http://localhost:4200/reset-password/...` (not prod) | PASS |
| tampered token → controlled 400, not 500 | PASS |
| valid token → reset succeeds, 200 | PASS |
| **old password → login FAIL after reset** | PASS |
| **new password → login PASS (`status:1`, real JWT)** | PASS — this was the bug found and fixed this session |
| reused (already-used) token → controlled 400, password NOT changed again | PASS |
| account state unchanged by reset (`Aktivan`, `AccountStatus`, `HasActivePackage`, `RequiresPackagePurchase`, `BrPolise`, `PaketId` identical before/after) | PASS |

Test account used: fresh throwaway `smoketestv2` (`smoketest_v2@master.local`, `PortalUserId=22`) — created, tested, and left in its final reset state. Real user account (`aleksa.paja98@gmail.com`, `Id=4`) and earlier test accounts (`Id=20/21`) from prior smoke testing were **not touched** in this session.

Not re-run in this session (already PASS in prior session, no code touched since): login-JWT/activation-token used as reset token (rejected by `purpose` claim check).

---

## 4. BUILD

- Backend: `dotnet build` — 0 errors (pre-existing warnings only: `NU1510`, `CS8625`, `CS0169` in unrelated files).
- Frontend: `npm run build` — 0 errors (pre-existing bundle-budget and CSS-selector warnings only).

---

## ACCOUNT LIFECYCLE COMPLETE: YES
