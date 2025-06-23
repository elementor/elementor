# Contributing

A guide on how to get started contributing code to the project.

Before diving into this repository, make sure you have a basic understanding of Elementor and its architecture.
This documentation primarily focuses on the packages, assuming you are already familiar with Elementor.

## Architecture
If you are interested in learning more about the architecture of Elementor Packages, please refer to the [Architecture](./docs/architecture.md) documentation.

## Repository structure

The repository is structured as follows:

```
.
├── demo
│   └── ...
├── docs
│   └── ...
├── packages
│   ├── core (core extension packages)
│   │   └── specific-package (example: editor)
│   │       ├── src
│   │       │   ├── components
│   │       │   │   ├── __tests__ (lives at the same level of the tested code)
│   │       │   │   │   ├── button.test.tsx
│   │       │   │   │   └── ...
│   │       │   │   ├── button.tsx
│   │       │   │   └── ...
│   │       │   ├── hooks
│   │       │   │   └── ...
│   │       │   ├── index.ts (entry point, exports all the public APIs)
│   │       │   ├── init.ts (initialization code)
│   │       ├── package.json
│   │       └── README.md
│   ├── libs (generic library packages)
│   │   └── ...
│   ├── pro (pro extension packages)
│   │   └── ...
│   └── tools (tools packages for development and build creation)
│       └── ...
├── scripts (internal development-related scripts)
│   └── ...
├── tests (global tests-related files such as setup & test-utils)
│   └── ...
├── README.md
└── package.json
```

## Test, Lint & Build

To run the tests, use the following command:
```bash
npm run test
```

It uses Jest as the test runner and provides a comprehensive report on the test results.

You can run the linter by executing:
```bash
npm run lint
```

Under the hood the `lint` command uses ESLint and tsc to perform static analysis of the code.

To build the packages, run the following command:
```bash
npm run build
```

This command will build all the packages (using `tsup`) and output the results to the `dist` directory in the root level of each package.

> By following these steps, you'll have the repository set up on your local machine, ready for development, testing, and exploration.

## Creating a new package

For creating a new package, please follow the instructions in the [Creating a new package](./docs/creating-a-new-package.md) documentation.

## Commit message conventions

This repository is using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), so please make sure to follow this convention to keep consistency
in the repository.

## Pull requests

Maintainers merge pull requests by squashing all commits and editing the commit message if necessary using the GitHub user interface.

Ensure you choose an appropriate commit message, and exercise caution when dealing with changes that may disrupt existing functionality.

Additionally, remember to include tests for your modifications to ensure comprehensive coverage and maintain code quality.

## Releases

We're using Changesets to manage versioning, which means that whenever you want to publish your changes, you'll need to
add a "changeset" to the PR that describes your changes and the version bump type (`patch`, `minor`, `major`). Use
`npx changeset` to create a new changeset, and follow the instructions. You can learn more about the process in
[Changesets' documentation](https://changesets-docs.vercel.app/).

## Testing in the Elementor plugin

To test and develop a package from the Elementor Packages repository, within the context of the Elementor Plugin, follow these steps:

1. Ensure that you have both the Elementor Plugin and Elementor Packages repositories cloned to your local machine.

2. Install the required dependencies in both of the repositories by running the following command in each repository directory:
```bash
npm install
```

3. Navigate to the Elementor Plugin repository:
```bash
cd <elementor-plugin-path>

# Example:
cd ~/Projects/elementor
```

4. In the Elementor Plugin repository, build the packages by running the following command:
```bash
npm run scripts:packages:local
```

This command will use your local copy of the packages as Webpack entries, instead of reading it from `node_modules`.
As you make changes in the Elementor Packages repository, the build process will automatically rebuild the assets.

(**Note**: You don't need to run `npm run dev` in the packages' repository. Webpack will handle it for you.)

By following these steps, you'll be able to work on your Elementor Plugin repository, with the Elementor Packages repository linked to it.
