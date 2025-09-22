# ccpsdemographics

This single page website illustrates the changing student demographics for the public schools in Charles County, Maryland.

Libraries that were used to help along the way:

- Vue.js (framework)
- Bootstrap (mainly for CSS)
- d3.js (for the summary chart)
- tippy (for the tooltip)
- Leaflet (for the map)

Improvements that can be made:

- Make the d3.js chart interactive, perhaps buttons to filter on grade level.
- Improve the UI/UX (especially for mobile)
- Unit test

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
