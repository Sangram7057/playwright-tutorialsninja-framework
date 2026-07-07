# Test Summary Report

## ✅ Result: ALL TESTS PASSED

- **Generated:** 2026-06-30T16:23:39.788Z
- **Application:** https://tutorialsninja.com/demo/
- **Browser(s):** chromium, firefox, webkit
- **Duration:** 213.2s

## Totals

| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped |
| ----- | --------- | --------- | -------- | ---------- |
| 57    | 53        | 0         | 1        | 3          |

## Details

### `regression/account.regression.spec.ts`

| Test                                                    | Status    | Duration |
| ------------------------------------------------------- | --------- | -------- |
| a registered user reaches the dashboard and can log out | ✅ Passed | 22.8s    |
| edit-account page is reachable when authenticated       | ✅ Passed | 21.7s    |
| a registered user reaches the dashboard and can log out | ✅ Passed | 23.2s    |
| edit-account page is reachable when authenticated       | ✅ Passed | 21.2s    |
| a registered user reaches the dashboard and can log out | ✅ Passed | 23.6s    |
| edit-account page is reachable when authenticated       | ✅ Passed | 22.6s    |

### `regression/cart.regression.spec.ts`

| Test                                                      | Status    | Duration |
| --------------------------------------------------------- | --------- | -------- |
| updating quantity keeps the product and re-renders totals | ✅ Passed | 20.0s    |
| removing the only product empties the cart                | ✅ Passed | 20.7s    |
| cart shows totals ready for checkout                      | ✅ Passed | 7.0s     |
| updating quantity keeps the product and re-renders totals | ✅ Passed | 25.8s    |
| removing the only product empties the cart                | ✅ Passed | 29.5s    |
| cart shows totals ready for checkout                      | ✅ Passed | 16.3s    |
| updating quantity keeps the product and re-renders totals | ✅ Passed | 24.2s    |
| removing the only product empties the cart                | ✅ Passed | 12.8s    |
| cart shows totals ready for checkout                      | ✅ Passed | 11.3s    |

### `regression/checkout.regression.spec.ts`

| Test                                | Status     | Duration |
| ----------------------------------- | ---------- | -------- |
| guest can place an order end-to-end | ⏭️ Skipped | 0.6s     |
| guest can place an order end-to-end | ⏭️ Skipped | 3.0s     |
| guest can place an order end-to-end | ⏭️ Skipped | 2.3s     |

### `regression/currency.regression.spec.ts`

| Test                                                | Status    | Duration |
| --------------------------------------------------- | --------- | -------- |
| switching currency updates the product price symbol | ✅ Passed | 8.5s     |
| switching currency updates the product price symbol | ✅ Passed | 15.9s    |
| switching currency updates the product price symbol | ✅ Passed | 11.7s    |

### `regression/navigation.regression.spec.ts`

| Test                                                   | Status    | Duration |
| ------------------------------------------------------ | --------- | -------- |
| opening a top-level category lands on its listing page | ✅ Passed | 4.9s     |
| all expected top-level categories are present          | ✅ Passed | 4.9s     |
| opening a top-level category lands on its listing page | ✅ Passed | 11.0s    |
| all expected top-level categories are present          | ✅ Passed | 8.5s     |
| opening a top-level category lands on its listing page | ✅ Passed | 7.0s     |
| all expected top-level categories are present          | ✅ Passed | 6.1s     |

### `regression/register.negative.regression.spec.ts`

| Test                                               | Status                     | Duration |
| -------------------------------------------------- | -------------------------- | -------- |
| registering with an already-used email is rejected | ✅ Passed                  | 12.4s    |
| mismatched password confirmation is rejected       | ✅ Passed                  | 7.1s     |
| registering with an already-used email is rejected | ⚠️ Flaky (passed on retry) | 34.3s    |
| mismatched password confirmation is rejected       | ✅ Passed                  | 7.8s     |
| registering with an already-used email is rejected | ✅ Passed                  | 21.6s    |
| mismatched password confirmation is rejected       | ✅ Passed                  | 10.0s    |

### `regression/wishlist.regression.spec.ts`

| Test                                                    | Status    | Duration |
| ------------------------------------------------------- | --------- | -------- |
| a product can be added to and removed from the wishlist | ✅ Passed | 5.7s     |
| a product can be added to and removed from the wishlist | ✅ Passed | 10.9s    |
| a product can be added to and removed from the wishlist | ✅ Passed | 11.1s    |

### `smoke/cart.smoke.spec.ts`

| Test                                            | Status    | Duration |
| ----------------------------------------------- | --------- | -------- |
| a product can be searched and added to the cart | ✅ Passed | 6.5s     |
| a product can be searched and added to the cart | ✅ Passed | 12.0s    |
| a product can be searched and added to the cart | ✅ Passed | 11.0s    |

### `smoke/home.smoke.spec.ts`

| Test                                   | Status    | Duration |
| -------------------------------------- | --------- | -------- |
| home page loads with featured products | ✅ Passed | 4.0s     |
| home page loads with featured products | ✅ Passed | 4.9s     |
| home page loads with featured products | ✅ Passed | 5.3s     |

### `smoke/login.smoke.spec.ts`

| Test                                            | Status    | Duration |
| ----------------------------------------------- | --------- | -------- |
| invalid credentials are rejected with a warning | ✅ Passed | 4.1s     |
| a registered customer can log in                | ✅ Passed | 6.6s     |
| invalid credentials are rejected with a warning | ✅ Passed | 5.8s     |
| a registered customer can log in                | ✅ Passed | 11.5s    |
| invalid credentials are rejected with a warning | ✅ Passed | 7.0s     |
| a registered customer can log in                | ✅ Passed | 15.2s    |

### `smoke/register.smoke.spec.ts`

| Test                                     | Status    | Duration |
| ---------------------------------------- | --------- | -------- |
| a new customer can register successfully | ✅ Passed | 4.9s     |
| a new customer can register successfully | ✅ Passed | 10.9s    |
| a new customer can register successfully | ✅ Passed | 9.5s     |

### `smoke/search.smoke.spec.ts`

| Test                                       | Status    | Duration |
| ------------------------------------------ | --------- | -------- |
| valid search returns matching products     | ✅ Passed | 3.3s     |
| nonsense search shows the no-results state | ✅ Passed | 2.8s     |
| valid search returns matching products     | ✅ Passed | 5.6s     |
| nonsense search shows the no-results state | ✅ Passed | 5.1s     |
| valid search returns matching products     | ✅ Passed | 5.9s     |
| nonsense search shows the no-results state | ✅ Passed | 5.2s     |

---

_Note: skipped entries are intentionally gated (e.g. the full order-placement E2E runs only against an instance with guest checkout enabled — see docs/local-opencart.md)._
