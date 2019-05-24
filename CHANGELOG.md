# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.10.0](https://github.com/sbrow/generator-npm-package/compare/v0.9.0...v0.10.0) (2019-05-24)


### Bug Fixes

* **BaseGenerator:** Webpack generator now correctly reads `useYarn`. ([b5881c6](https://github.com/sbrow/generator-npm-package/commit/b5881c6))
* **Installer:** Correctly lists all packages to be installed. ([ce05883](https://github.com/sbrow/generator-npm-package/commit/ce05883))
* **Typescript:** Adds `"jsx": "react"` to `tsconfig.json` when installed with React. ([80ae69c](https://github.com/sbrow/generator-npm-package/commit/80ae69c))
* **Webpack:** Now installs `webpack-cli` alongside `webpack`. ([c235c83](https://github.com/sbrow/generator-npm-package/commit/c235c83))


### Build System

* **coveralls:** `coveralls` script should now send data in the accepted format. ([9d26efb](https://github.com/sbrow/generator-npm-package/commit/9d26efb))
* **coveralls:** Updated coveralls. ([801007a](https://github.com/sbrow/generator-npm-package/commit/801007a))
* **package.json:** Added "prepare" and "coveralls" scripts. ([ed61cd2](https://github.com/sbrow/generator-npm-package/commit/ed61cd2))
* **package.json:** Removed extraneous `env` script. ([d371df3](https://github.com/sbrow/generator-npm-package/commit/d371df3))
* **package.json:** Updated `engines.npm` to `>= 8.11.0`. ([1299cad](https://github.com/sbrow/generator-npm-package/commit/1299cad))


### Features

* **Installer:** Added `Other` category for one-off packages. ([5b7908b](https://github.com/sbrow/generator-npm-package/commit/5b7908b))


### Tests

* **Webpack:** Fixed test to match change made in f048b5. ([4508c52](https://github.com/sbrow/generator-npm-package/commit/4508c52))
* Now runs properly. ([9872858](https://github.com/sbrow/generator-npm-package/commit/9872858))
* **Typescript:** Added test('sets "jsx" to "react"'). ([d5e4fc6](https://github.com/sbrow/generator-npm-package/commit/d5e4fc6))



## [0.9.0](https://github.com/sbrow/generator-npm-package/compare/v0.8.0...v0.9.0) (2019-05-18)


### Build System

* **package.json:** Removed some type definitions. ([50f888d](https://github.com/sbrow/generator-npm-package/commit/50f888d))


### Features

* **BaseGenerator:** Now attempts to run `npm install` in silent mode. ([7c2c1e4](https://github.com/sbrow/generator-npm-package/commit/7c2c1e4))



## [0.8.0](https://github.com/sbrow/generator-npm-package/compare/v0.7.0...v0.8.0) (2019-05-18)


### Bug Fixes

* **App:** generator-npm-init is no longer called when target direcroty isn't empty. ([7d7bef2](https://github.com/sbrow/generator-npm-package/commit/7d7bef2))


### Features

* **package.json:** Added `standard-version` package and corresponding script. ([39ef6e6](https://github.com/sbrow/generator-npm-package/commit/39ef6e6))
* **Webpack:** Installs and configures `ts-loader` when appropriate. ([a8edc0e](https://github.com/sbrow/generator-npm-package/commit/a8edc0e))


### Tests

* Skipping broken tests. ([3309b26](https://github.com/sbrow/generator-npm-package/commit/3309b26))