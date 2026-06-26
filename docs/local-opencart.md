# Local OpenCart — running the full checkout E2E

The public TutorialsNinja demo **disables guest checkout and blocks order
placement** (`checkout/checkout` redirects to the cart). To exercise the full
order-placement flow, run the framework against a private OpenCart instance.

## 1. Start OpenCart

```bash
docker compose up -d
```

First boot installs the database — give it ~1–2 minutes. The store is then at:

- Storefront: <http://localhost:8080/>
- Admin: <http://localhost:8080/administration/> (user `admin`, pass `bitnami123`)

Check it is ready:

```bash
curl -I http://localhost:8080/
```

## 2. Ensure guest checkout is enabled

OpenCart enables guest checkout by default. To confirm/toggle it:

1. Log in to the admin panel.
2. **System → Settings →** edit your store **→ Option** tab.
3. Under **Checkout**, set **Guest Checkout = Yes** and save.

## 3. Run the checkout E2E

Point the framework at the local store and enable the gated test:

```bash
# bash / Git Bash
BASE_URL=http://localhost:8080/ RUN_CHECKOUT_E2E=true npm run test:regression
```

```powershell
# PowerShell
$env:BASE_URL='http://localhost:8080/'; $env:RUN_CHECKOUT_E2E='true'; npm run test:regression
```

Or run just the checkout spec:

```bash
BASE_URL=http://localhost:8080/ RUN_CHECKOUT_E2E=true npx playwright test checkout.regression --project=chromium
```

## How the gating works

The order-placement test in
[tests/regression/checkout.regression.spec.ts](../tests/regression/checkout.regression.spec.ts)
is a **real test**, not `test.fixme`. It calls `test.skip(!env.runCheckoutE2E, …)`,
so it:

- **skips** by default (e.g. against the demo), and
- **runs** when `RUN_CHECKOUT_E2E=true` against an instance with guest checkout.

This keeps the suite green everywhere while making the E2E runnable on demand.

## Tear down

```bash
docker compose down          # stop containers
docker compose down -v       # stop and remove volumes (fresh install next time)
```

## Notes

- The page objects target the **OpenCart 3.x** DOM (same family as the demo).
  OpenCart 4 reworked the checkout into a single page and would require selector
  updates in `pages/checkout.page.ts`.
- Product ids differ from the demo. Update `test-data/*.json` (e.g. the search
  term / product name) if your catalogue differs from the default sample data.
