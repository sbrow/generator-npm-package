# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.3](https://github.com/sbrow/generator-npm-package/compare/generator-package-installer@2.0.2...generator-package-installer@2.0.3) (2019-07-16)

**Note:** Version bump only for package generator-package-installer





## [2.0.2](https://github.com/sbrow/generator-npm-package/compare/generator-package-installer@2.0.1...generator-package-installer@2.0.2) (2019-07-16)


### Bug Fixes

* build errors. ([290fde7](https://github.com/sbrow/generator-npm-package/commit/290fde7))





## [2.0.1](https://github.com/sbrow/generator-npm-package/compare/generator-package-installer@2.0.0...generator-package-installer@2.0.1) (2019-07-16)


### Bug Fixes

* **addPackages:** Now handles packages with `devOnly` correctly. ([ed22a6b](https://github.com/sbrow/generator-npm-package/commit/ed22a6b))





# 2.0.0 (2019-07-15)


### Bug Fixes

* **Package:** Tightened up interfaces. ([378ee2e](https://github.com/sbrow/generator-npm-package/commit/378ee2e))


### Code Refactoring

* **generator-package:** Converted `Package` Object to an interface. ([9836743](https://github.com/sbrow/generator-npm-package/commit/9836743))


### Features

* **packages:** Added `devOnly` function that creates a list of devOnly packages. ([1a28faa](https://github.com/sbrow/generator-npm-package/commit/1a28faa))


### BREAKING CHANGES

* **generator-package:** `Package` is no longer a class. Now it is an interface.
