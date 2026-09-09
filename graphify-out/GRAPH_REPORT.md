# Graph Report - sajt-pretraga-front  (2026-09-09)

## Corpus Check
- 88 files · ~32,611 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 684 nodes · 1163 edges · 61 communities (29 shown, 31 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28b9cbdf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- master.service.ts
- CurrentUserService
- DzoService
- login-register.component.ts
- devDependencies
- FormaComponent
- KupovinaPaketaComponent
- RefundacijeComponent
- ResetPasswordComponent
- FRONTEND BLOCK 1 — HANDOFF
- app.module.ts
- options
- sajt-pretraga-front
- ConfirmMailComponent
- AuthService
- FormularZaLeadoveComponent
- auth.service.ts
- HomeComponent
- styles
- HeaderComponent
- api-error.interceptor.ts
- dependencies
- production
- development
- SajtPretragaFront
- architect
- ACCOUNT LIFECYCLE — Forgot/Reset Password — HANDOFF
- moji-pregledi-routing.module.ts
- FooterComponent
- CustomDateParserFormatter
- build
- @angular/common
- @angular/compiler
- @angular/core
- @angular/forms
- angular-jwt
- @angular/material
- @angular/platform-browser-dynamic
- @angular/router
- bootstrap
- bootstrap-icons
- CLAUDE.md
- file-saver
- font-awesome
- @fortawesome/fontawesome-free
- jquery
- moment
- @ng-bootstrap/ng-bootstrap
- ngx-bootstrap-icons
- ngx-cookie-service
- ngx-pagination
- ngx-spinner
- ngx-toastr
- @popperjs/core
- primeicons
- primeng
- rxjs
- tslib
- zone.js
- environment.prod.ts

## God Nodes (most connected - your core abstractions)
1. `MasterService` - 39 edges
2. `AuthService` - 37 edges
3. `CurrentUserService` - 36 edges
4. `FormaComponent` - 29 edges
5. `ApiResponse` - 21 edges
6. `KupovinaPaketaComponent` - 20 edges
7. `DzoService` - 19 edges
8. `LoginRegisterComponent` - 16 edges
9. `MojiPreglediComponent` - 15 edges
10. `CurrentUser` - 15 edges

## Surprising Connections (you probably didn't know these)
- `DzoComponent` --references--> `MedUstanova`  [EXTRACTED]
  src/app/components/portali/dzo/dzo.component.ts → src/app/shared/models/medUstanova.ts
- `KupovinaPaketaComponent` --references--> `CurrentUser`  [EXTRACTED]
  src/app/components/portali/kupovina-paketa/kupovina-paketa.component.ts → src/app/shared/models/current-user.ts
- `KupovinaPaketaComponent` --references--> `PackageDetails`  [EXTRACTED]
  src/app/components/portali/kupovina-paketa/kupovina-paketa.component.ts → src/app/shared/models/master.ts
- `KupovinaPaketaComponent` --references--> `PackageListItem`  [EXTRACTED]
  src/app/components/portali/kupovina-paketa/kupovina-paketa.component.ts → src/app/shared/models/master.ts
- `MojiPreglediComponent` --references--> `DocumentListItem`  [EXTRACTED]
  src/app/components/portali/moji-pregledi/moji-pregledi.component.ts → src/app/shared/models/master.ts

## Import Cycles
- None detected.

## Communities (61 total, 31 thin omitted)

### Community 0 - "master.service.ts"
Cohesion: 0.05
Nodes (42): MojiPreglediComponent, STATUS_SEVERITY, TERMINAL_STATUSES, Component, notPastDateValidator(), Component, ZakaziPregledComponent, ApiError (+34 more)

### Community 1 - "CurrentUserService"
Cohesion: 0.06
Nodes (24): AppComponent, Component, routes, ProfilComponent, Component, ActivePackageGuard, Injectable, AuthGuard (+16 more)

### Community 2 - "DzoService"
Cohesion: 0.06
Nodes (20): allowedCommonJsDependencies, lodash, moment, rxjs-compat, DzoComponent, Component, PaketiComponent, Component (+12 more)

### Community 3 - "login-register.component.ts"
Cohesion: 0.08
Nodes (20): LoginRegisterComponent, Component, TokenState, LoginModule, NgModule, LoginRoutingModule, routes, NgModule (+12 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (38): @angular/compiler-cli, @angular-devkit/build-angular, @angular/localize, jasmine-core, karma, karma-chrome-launcher, karma-coverage, karma-jasmine (+30 more)

### Community 5 - "FormaComponent"
Cohesion: 0.07
Nodes (7): FormaComponent, Component, FormaModule, NgModule, FormaRoutingModule, routes, NgModule

### Community 6 - "KupovinaPaketaComponent"
Cohesion: 0.10
Nodes (15): KupovinaPaketaComponent, Step, Component, PackageListItem, KupovinaPaketaModule, NgModule, KupovinaPaketaRoutingModule, routes (+7 more)

### Community 7 - "RefundacijeComponent"
Cohesion: 0.11
Nodes (10): RefundacijeComponent, Component, ViewChild, RefundacijeModule, NgModule, RefundacijeRoutingModule, routes, NgModule (+2 more)

### Community 8 - "ResetPasswordComponent"
Cohesion: 0.12
Nodes (9): ResetPasswordComponent, Component, ResetPassGuard, Injectable, ResetPasswordModule, NgModule, ResetPasswordRoutingModule, routes (+1 more)

### Community 9 - "FRONTEND BLOCK 1 — HANDOFF"
Cohesion: 0.11
Nodes (17): 0. BACKEND BLOCKER — DUPLICATE JMBG (approved fix), 10. FILES CHANGED, 11. FINAL DECISION, 1. IMPLEMENTED (frontend), 2. CURRENT-USER STATE, 3. NAVBAR / MENU, 4. PACKAGE PURCHASE FLOW (new), 5. LEGACY TRUSTED-IDENTITY CLEANUP (+9 more)

### Community 10 - "app.module.ts"
Cohesion: 0.17
Nodes (9): Pipe, AppModule, NgModule, AppRoutingModule, NgModule, PrimengModule, NgModule, MedUstanova (+1 more)

### Community 11 - "options"
Cohesion: 0.16
Nodes (16): options, assets, index, inlineStyleLanguage, main, outputPath, polyfills, scripts (+8 more)

### Community 12 - "sajt-pretraga-front"
Cohesion: 0.13
Nodes (14): analytics, cli, newProjectRoot, projects, sajt-pretraga-front, prefix, projectType, root (+6 more)

### Community 13 - "ConfirmMailComponent"
Cohesion: 0.15
Nodes (7): ConfirmMailComponent, Component, ConfirmMailModule, NgModule, ConfirmMailRoutingModule, routes, NgModule

### Community 14 - "AuthService"
Cohesion: 0.18
Nodes (3): LoginUser, AuthService, Injectable

### Community 15 - "FormularZaLeadoveComponent"
Cohesion: 0.15
Nodes (7): FormularZaLeadoveComponent, Component, FormaZaLeadoveModule, NgModule, FormaZaLeadoveRoutingModule, routes, NgModule

### Community 16 - "auth.service.ts"
Cohesion: 0.31
Nodes (3): ApiService, Injectable, environment

### Community 17 - "HomeComponent"
Cohesion: 0.18
Nodes (7): HomeComponent, Component, HomeModule, NgModule, HomeRoutingModule, routes, NgModule

### Community 18 - "styles"
Cohesion: 0.17
Nodes (12): styles, @angular/material/prebuilt-themes/indigo-pink.css, node_modules/bootstrap/dist/css/bootstrap.min.css, node_modules/bootstrap-icons/font/bootstrap-icons.css, node_modules/bootstrap/scss/bootstrap.scss, node_modules/font-awesome/css/font-awesome.min.css, node_modules/ngx-spinner/animations/triangle-skew-spin.css, node_modules/ngx-toastr/toastr.css (+4 more)

### Community 19 - "HeaderComponent"
Cohesion: 0.21
Nodes (4): HostListener, HeaderComponent, Component, ViewChild

### Community 20 - "api-error.interceptor.ts"
Cohesion: 0.21
Nodes (3): ApiErrorInterceptor, extractApiErrorMessage(), Injectable

### Community 21 - "dependencies"
Cohesion: 0.22
Nodes (9): @angular/animations, @angular/cdk, @angular/platform-browser, @auth0/angular-jwt, dependencies, @angular/animations, @angular/cdk, @angular/platform-browser (+1 more)

### Community 22 - "production"
Cohesion: 0.25
Nodes (8): serve, production, browserTarget, budgets, outputHashing, builder, configurations, defaultConfiguration

### Community 23 - "development"
Cohesion: 0.25
Nodes (8): development, browserTarget, buildOptimizer, extractLicenses, namedChunks, optimization, sourceMap, vendorChunk

### Community 24 - "SajtPretragaFront"
Cohesion: 0.25
Nodes (7): Build, Code scaffolding, Development server, Further help, Running end-to-end tests, Running unit tests, SajtPretragaFront

### Community 25 - "architect"
Cohesion: 0.29
Nodes (7): extract-i18n, test, builder, options, browserTarget, architect, builder

### Community 26 - "ACCOUNT LIFECYCLE — Forgot/Reset Password — HANDOFF"
Cohesion: 0.29
Nodes (6): 1. BACKEND, 2. FRONTEND, 3. MANUAL SMOKE TEST (real run against dev Mailpit + dev SQL Server, throwaway test account, this session), 4. BUILD, ACCOUNT LIFECYCLE COMPLETE: YES, ACCOUNT LIFECYCLE — Forgot/Reset Password — HANDOFF

### Community 27 - "moji-pregledi-routing.module.ts"
Cohesion: 0.33
Nodes (5): MojiPreglediModule, NgModule, MojiPreglediRoutingModule, routes, NgModule

### Community 30 - "build"
Cohesion: 0.50
Nodes (4): build, builder, configurations, defaultConfiguration

## Knowledge Gaps
- **156 isolated node(s):** `$schema`, `version`, `newProjectRoot`, `projectType`, `style` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 275 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `moment` connect `DzoService` to `auth.service.ts`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `allowedCommonJsDependencies` connect `DzoService` to `options`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `options` connect `options` to `DzoService`, `styles`, `build`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `newProjectRoot` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `master.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05126050420168067 - nodes in this community are weakly interconnected._
- **Should `CurrentUserService` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Should `DzoService` be split into smaller, more focused modules?**
  _Cohesion score 0.05507246376811594 - nodes in this community are weakly interconnected._