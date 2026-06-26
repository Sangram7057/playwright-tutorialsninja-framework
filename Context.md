# Project Context

## Project Name

TutorialsNinja Automation Framework

---

## Objective

Build an enterprise-grade Playwright automation framework using TypeScript.

The framework should be modular, scalable, reusable and production ready.

Claude Code must behave like a Senior QA Automation Architect.

Never generate beginner-level code.

Always follow industry best practices.

---

## Application Under Test

https://tutorialsninja.com/demo/index.php?route=common/home

Modules

- Home
- Login
- Register
- Search
- Product Details
- Wishlist
- Shopping Cart
- Checkout
- Account
- Logout

---

## Technology Stack

Language:
TypeScript

Automation:
Playwright

Pattern:
Page Object Model

Assertions:
Playwright Expect

Reporter:
Allure
HTML Report

Logging:
Winston

Environment:
dotenv

Data:
JSON

CI/CD:
GitHub Actions

Lint:
ESLint

Formatting:
Prettier

---

## Framework Standards

Use:

✓ SOLID Principles

✓ DRY

✓ KISS

✓ Single Responsibility Principle

✓ Clean Architecture

✓ Reusable Components

✓ Generic Utilities

✓ No Duplicate Code

---

## Coding Standards

Every method

- small
- reusable
- readable

Avoid long methods.

Never hardcode selectors.

Store selectors inside Page Objects.

Never place locators inside test files.

Use descriptive variable names.

No magic numbers.

Use constants.

---

## Locator Strategy

Priority

1. data-testid
2. id
3. name
4. role
5. text
6. css
7. xpath (last option)

Always generate stable locators.

---

## Test Design

Each test must

Arrange

Act

Assert

One scenario per test.

Independent tests.

No dependency.

Parallel execution supported.

Retry supported.

---

## Reporting

Capture

Screenshot on failure

Video

Trace

HTML report

Allure report

Execution time

Environment details

---

## Logging

Every action should log

Browser launched

Navigation

Click

Fill

Validation

Failure

Retry

Screenshot location

---

## Browser Support

Chromium

Firefox

WebKit

Headless

Headed

---

## Test Data

Use JSON

Never hardcode credentials.

Generate random users where necessary.

---

## Page Object Model

Each page contains

Locators

Actions

Validations

No assertions inside action methods.

Assertions stay in tests.

---

## Utilities

Framework should include

Logger

Wait Helper

Browser Helper

Screenshot Helper

Retry Helper

Date Helper

Random Generator

Environment Loader

---

## Fixtures

Create fixtures for

Browser

Context

Page

Test Data

Authentication

---

## CI/CD

GitHub Actions

Run

npm ci

playwright install

execute tests

generate reports

upload artifacts

---

## MCP Servers

Claude should use

Filesystem MCP

- Create files
- Update files
- Read files

Playwright MCP

- Inspect application
- Generate stable locators
- Validate UI

Sequential Thinking MCP

- Break work into tasks
- Build step by step

Git MCP

- Commit changes
- Review project

Memory MCP

- Remember architecture
- Maintain consistency

---

## Expected Architecture

pages/

components/

fixtures/

utils/

helpers/

tests/

config/

reports/

No unnecessary folders.

---

## Error Handling

Every page action should

Wait

Retry

Log

Throw meaningful errors

Capture screenshots

---

## Naming Convention

Pages

LoginPage

HomePage

CartPage

Methods

login()

logout()

searchProduct()

Selectors

emailTextbox

passwordTextbox

loginButton

Tests

login.spec.ts

search.spec.ts

cart.spec.ts

---

## Best Practices

Avoid Thread.sleep()

Use Playwright auto wait.

Prefer getByRole()

Use async await.

Avoid force click.

Avoid fixed waits.

Use explicit assertions.

---

## Goal

Create a framework similar to one used by top product companies.

Code quality should resemble work from a Senior Automation Engineer with 8+ years of experience.