# Creating a New Package

This document describes the process of creating a new package in the monorepo.
It will also help you determine if you should create a new package or add your code to an existing package.

## When a New Package Should be Created?

In order to make the monorepo manageable, we try to avoid creating unnecessary packages. Therefore, we don't create a new package unless we _really_ need to.

To determine if some code should be inside an existing package or have its own package, we usually ask ourselves the following questions:

1.  Do we already have an existing package that can fit this new feature?
2.  Is this code related to a domain that we haven't covered yet in a package?
3.  Does this area in the editor (product-wise) belong to another team? (i.e. an extension of the app-bar might be inside the app-bar package, but could also be a package of its own)
4.  Do we have any reason to consume this code as a standalone package? (i.e. we might put stuff inside `@elementor/env` & `@elementor/store` packages for example, or we would merge them into a single `@elementor/infra` package, depending on the situation and requirements)


## How to Create a New Package?

1. Create a new directory for the package, and a package.json file inside it (see others for reference. In the future, we'll have a CLI tool for that). 
2. Add your package code to the source directory.
3. Test your code using the [Demo application](../demo/README.md). 
4. Ensure compatibility by testing in the Elementor plugin using those [guidelines](../CONTRIBUTING.md#testing-in-the-elementor-plugin).
5. Implement unit tests for your code.
6. Open a Pull Request (PR) for review and eventual merge.

### Publishing a New Package

By merging your changes, the package will be published to npm automatically.
If you want to skip publishing a package, you can apply the `skip publish` label to the pull request.

### Test Your Package in Elementor Plugin

For testing a package from the Elementor Packages repository, within the context of the Elementor Plugin, follow the steps in the [contribution guide](../CONTRIBUTING.md#testing-in-the-elementor-plugin).

### Adding the Package to Elementor Core Plugin

In order to add a new package to Elementor Core, you need to do the following:
1. Install the newly published version of the package in the plugin (`npm i @elementor/package-name`).
2. To load the package within the plugin, you can choose from the following options:
   - Direct Loading: Add the package name directly to the editor loader file `{elementor-plugin-path}/core/editor/loader/v2/editor-v2-loader.php`. This option always loads the package.
   - Conditional Loading: Add the package name to the filter `elementor/editor/v2/packages`. This option provides flexibility, enabling you to load the package based on specific criteria. It also allows you to encapsulate the package loading separately for better organization and maintainability.
3. Ensure that everything works properly.
4. Open a PR and merge your new changes (main, release, etc.).

### Adding the Package to Elementor Pro Plugin

In order to add a new package to Elementor Pro, you need to do the following:
1. Install the newly published version of the package in the plugin (`npm i @elementor/package-name`).
2. To load the package within the plugin, you can choose from the following options:
    - Direct Loading: Add the package name directly to the editor loader file `{elementor-pro-plugin-path}/core/editor/editor.php`. This option always loads the package.
    - Conditional Loading: Add the package name to the filter `elementor-pro/editor/v2/packages`. This option provides flexibility, enabling you to load the package based on specific criteria. It also allows you to encapsulate the package loading separately for better organization and maintainability.
3. Ensure that everything works properly.
4. Open a PR and merge your new changes (main, release, etc.).
