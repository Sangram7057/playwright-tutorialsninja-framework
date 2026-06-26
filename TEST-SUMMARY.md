# Test Summary Report

## ✅ Result: ALL TESTS PASSED

- **Generated:** 2026-06-26T10:16:44.000Z
- **Application:** https://tutorialsninja.com/demo/
- **Browser(s):** chromium
- **Duration:** 75.9s

## Totals

| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped |
| ----- | --------- | --------- | -------- | ---------- |
| 19    | 18        | 0         | 0        | 1          |

## Details

### `regression/account.regression.spec.ts`

| Test                                                    | Status    | Duration |
| ------------------------------------------------------- | --------- | -------- |
| a registered user reaches the dashboard and can log out | ✅ Passed | 20.0s    |
| edit-account page is reachable when authenticated       | ✅ Passed | 14.1s    |

### `regression/cart.regression.spec.ts`

| Test                                                      | Status    | Duration |
| --------------------------------------------------------- | --------- | -------- |
| updating quantity keeps the product and re-renders totals | ✅ Passed | 4.1s     |
| removing the only product empties the cart                | ✅ Passed | 3.9s     |
| cart shows totals ready for checkout                      | ✅ Passed | 3.2s     |

### `regression/checkout.regression.spec.ts`

| Test                                | Status     | Duration |
| ----------------------------------- | ---------- | -------- |
| guest can place an order end-to-end | ⏭️ Skipped | 0.4s     |

### `regression/currency.regression.spec.ts`

| Test                                                | Status    | Duration |
| --------------------------------------------------- | --------- | -------- |
| switching currency updates the product price symbol | ✅ Passed | 2.8s     |

### `regression/navigation.regression.spec.ts`

| Test                                                   | Status    | Duration |
| ------------------------------------------------------ | --------- | -------- |
| opening a top-level category lands on its listing page | ✅ Passed | 2.0s     |
| all expected top-level categories are present          | ✅ Passed | 1.3s     |

### `regression/register.negative.regression.spec.ts`

| Test                                               | Status    | Duration |
| -------------------------------------------------- | --------- | -------- |
| registering with an already-used email is rejected | ✅ Passed | 27.3s    |
| mismatched password confirmation is rejected       | ✅ Passed | 4.4s     |

### `regression/wishlist.regression.spec.ts`

| Test                                                    | Status    | Duration |
| ------------------------------------------------------- | --------- | -------- |
| a product can be added to and removed from the wishlist | ✅ Passed | 3.5s     |

### `smoke/cart.smoke.spec.ts`

| Test                                            | Status    | Duration |
| ----------------------------------------------- | --------- | -------- |
| a product can be searched and added to the cart | ✅ Passed | 4.2s     |

### `smoke/home.smoke.spec.ts`

| Test                                   | Status    | Duration |
| -------------------------------------- | --------- | -------- |
| home page loads with featured products | ✅ Passed | 3.7s     |

### `smoke/login.smoke.spec.ts`

| Test                                            | Status    | Duration |
| ----------------------------------------------- | --------- | -------- |
| invalid credentials are rejected with a warning | ✅ Passed | 4.3s     |
| a registered customer can log in                | ✅ Passed | 5.4s     |

### `smoke/register.smoke.spec.ts`

| Test                                     | Status    | Duration |
| ---------------------------------------- | --------- | -------- |
| a new customer can register successfully | ✅ Passed | 16.1s    |

### `smoke/search.smoke.spec.ts`

| Test                                       | Status    | Duration |
| ------------------------------------------ | --------- | -------- |
| valid search returns matching products     | ✅ Passed | 1.8s     |
| nonsense search shows the no-results state | ✅ Passed | 1.7s     |

---

_Note: skipped entries are intentionally gated (e.g. the full order-placement E2E runs only against an instance with guest checkout enabled — see docs/local-opencart.md)._
