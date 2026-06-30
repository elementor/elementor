# Architecture

## Overview

The original Editor as we know it, is a monolith application built over the years by a small group of people.
At first, it was a simple application that could be handled by only a few people, but as time passed, it became more
complex and harder to maintain.

In order to make it easier to maintain and develop, we decided to split the application into smaller pieces, that can be
developed and maintained by different teams. This pattern is usually called a "micro-frontend" architecture.

> [!NOTE]
> We're going to use the term "micro-frontend" loosely here since the approach we were going for is probably not the
> most common one, and it's probably not the standard micro-frontend you're familiar with. We're using it because it's
> the closest term that describes our architecture.

### Goals

Before choosing a micro-frontend architecture, we've set some goals that we want to achieve:

1. **Independent Development** - Each team should be able to develop their part of the application without having to 
	coordinate with other teams.
2. **Standard-as-Possible** - The code should be written in a standard way, so onboarding new developers will be easier.
	We didn't want to invent new ways to write code or have some magical methods but rather use existing tools and 
	patterns.
3. **Type Safe** - It was clear to everyone that we wanted to use TypeScript, and we wanted to make sure that the
	code is type-safe, especially when being used in a micro-frontend environment where contracts between modules
	should be as strict as possible.
4. **Extensible** - Since the application is going to be extended dynamically by 3rd party scripts that we don't know 
	about in build time, we have to make sure that they're able to "push" (or "inject") their code into our application, 
	rather than us "pulling" (or "importing") it from their application.
5. **Client-Side APIs** - All extension APIs should be client-side, so an application that extends our code can be
	easily integrated without the hassle of having some parts of it in the backend and others in the frontend (like we
	have today), and to make it easier for non-WordPress developers to integrate with our application.

The outcome of those requirements is what we call _"Editor V2"_ - A modular, composable, and extensible application
that's built with React & TypeScript, and allows dynamic extensions by 3rd party scripts.

## Why React?

It was pretty obvious to all of us that we needed to use one of the biggest, well-known, and battle-tested UI libraries
for this project (e.g. React, Vue, or Angular), and can't rely on a small, cutting-edge one (even though we would _love_
to).

We've decided to use [React](https://react.dev/) as our UI library since it's the most popular UI library in the 
WordPress community, [it's being used by WordPress itself](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-element/#why-react),
and it's the one we're most familiar with. It also has a wide community and a lot of resources, so it's easier to find
solutions for problems we might encounter.

## Micro-Frontend Architecture

Before jumping into the details of how we chose a micro-frontend architecture, it's important to explain one of the
requirements we have - _Dynamic Extensibility_.

### Dynamic Extensibility

One main powerful feature of Elementor's Editor is its extensibility. Instead of just having a single application
with the baked-in features that Elementor provides, we allow people from the community to add more features by writing 
their own scripts (i.e. a 3rd party extension can add a button or a panel that introduces a new feature).
In addition, we handle Elementor Pro internally as a 3rd party extension, so even without taking the community 
developers into account, dynamically loading extensions is an essential capability for us.

### Choosing The Right Tool

There are many ways to implement a micro-frontend architecture, and we've considered some of them while trying to find a 
solution that fits our needs. Among the solutions we've tried are:

- Single SPA
- Webpack Module Federation
- Webpack Externals

#### Single SPA

[Single SPA](https://single-spa.js.org/) is a framework that allows you to manage a micro-frontend architecture. It 
lets you have multiple applications running on the same page, and it handles the routing between them. It has some
interesting concepts like ["Applications", "Parcels" and "Utility modules"](https://single-spa.js.org/docs/microfrontends-concept/#types-of-microfrontends), 
and it's being used by many companies.

We've decided not to use it since it lacks documentation and community resources, is not familiar enough among the
WordPress community we're part of, and doesn't give us dynamic application-loading support with type-safety 
out-of-the-box. 

#### Webpack Module Federation

[Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) is a new & powerful feature of Webpack 5
that allows you to share code between applications and helps you build a micro-frontend architecture while handling
code sharing and package versioning for you. 

It's an appealing option, and we've tried using it in our application, but we haven't been able to make it load
applications dynamically out-of-the-box without writing some magics or without making the code feel non-standard.
Having a set of known [remote entries](https://webpack.js.org/concepts/module-federation/#low-level-concepts) at build
time makes it a great option, but as we've already mentioned we don't have this luxury.

#### Webpack Externals

[Webpack Externals](https://webpack.js.org/configuration/externals/) is a feature of Webpack (or any other modern
bundler) that allows you to tell Webpack that some modules are going to be available dynamically in runtime and that it
shouldn't bundle them into the main bundle.
Together with the [library option](https://webpack.js.org/configuration/output/#outputlibrary), that lets you expose
your code as a global variable, they make a convenient solution for dynamic code loading.

This is the solution we've chosen to go with since it's simple, lets us have 100% standard code (the magic happens in
build time by Webpack, rather than in runtime by the developers), and it allows us to load code dynamically with 
standard syntax. It's also the solution that's being used by WordPress itself (via `window.wp`, `window.React` and 
`window.ReactDOM`), so it's familiar to the community.

## Packages

As part of dividing the application into smaller pieces, we've decided to split the code into multiple packages, each
one responsible for a different part of the application. With this approach, each team can develop their part of the
application independently, and we can have a better separation of concerns.

Similarly to Single SPA, we have categorized each package within this repository as an "app", "extension", "library" or 
"tool", based on its purpose, in order to bring some clarity and structure to our codebase:

- **App**: Represents a standalone application, providing essential features as a foundational component.
- **Extension**: Enhances and extends the functionality of an app package.
- **Library**: A general-purpose NPM package with reusable functionality that can be utilized across various parts of
	other packages or even outside of this project.
- **Tool**: Package that is used to support the development process, such as Webpack plugin.

### APIs & Inter-Package Dependencies

Each package exposes a set of APIs that other packages can import (e.g. hooks, components, etc.) in order to interact 
with it. By relying on concrete APIs for inter-package interactions, instead of handling the communication based on
strings (via events, commands, etc.), we can have a clear understanding of the dependencies between the packages, and 
to easily refactor the code without breaking anything. In addition, it improves the developer experience by having 
type-safety and auto-completion in the IDE.

### Handled As 3rd Party Extensions

In order to make our code modular and composable, and to ensure that the APIs we expose to 3rd party developers are
actually working and usable in real-world scenarios, we've decided to handle everything as a 3rd party extension.
This means that our internal packages that compose the Editor itself are also being handled like 3rd party extensions
(i.e. the App-Bar extension exposes menus so other packages can inject items into them, while also injecting itself into
the Editor application). It also helps us understand the connections and dependencies between the packages, and easily 
remove some of them completely when needed (i.e. based on feature flags, user permissions, etc.).

## Communication With The Legacy Editor

Since we're building a new Editor that's going to replace the existing one, we need to make sure that we can communicate
between them in order to support the transition period. To do that, we've created a set of adapters that are being used
to talk with the legacy APIs. These adapters allow us to run legacy 
[commands](https://developers.elementor.com/js-api/js-api-commands/) and open legacy
[routes](https://developers.elementor.com/js-api/js-api-routes/). It also helps us subscribe to states in the legacy 
Editor in order to keep the new one in sync with it, while making the states reactive for new React-based
extensions.

Those adapters are meant for internal use only. The idea is to wrap all the legacy states & APIs with modern code, and 
eventually remove the legacy code completely. We're not exposing those adapters to 3rd party developers, and we're 
planning to remove them in the future.

## Runtime Connections

Because we have dynamic extensions, all the connections between the applications and their extensions happen in runtime.
This means that we need to have a way of orchestrating everything in runtime. In order to do that we've used a pattern 
called "pluggable".

### Pluggable Components

React doesn't have a built-in way to make components pluggable, so we had to come up with a solution ourselves. We've
looked at other existing solutions such as Gutenberg's [SlotFills](https://developer.wordpress.org/block-editor/reference-guides/slotfills/)
approach, and [React Pluggable](https://react-pluggable.github.io/).

Neither of them was a good fit for us, mostly because we didn't like the idea of having strings "hanging in the air"
instead of having an actual reference with type-safety and clear dependencies, so we've decided to come up with our own
solution. From a high-level perspective, it's basically a
[javascript Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) that's being
created inside a closure and acts as a container that lets you push components into it. Later on, you can read them on
render-time using a custom hook we provide. You can read more about it [here](../packages/libs/locations/README.md).

### Runtime Versioning

The fact that we're loading the packages dynamically means that the package version you're using in build time is not
necessarily the same version you're going to get in runtime. This may lead to API compatibility issues in runtime, so
we've decided that in order to avoid it we'll keep full backward compatibility for all the APIs we expose from a package
that has been defined as stable.

## Application Lifecycle

The application lifecycle consists of 5 phases:
	
1. **Load** - When we (and 3rd parties) load the necessary scripts using [`wp_enqueue_script`](https://developer.wordpress.org/reference/functions/wp_enqueue_script/).
2. **Environment Variables** - When we set up the runtime environment variables for the applications to use
   (you can read more about it [here](../packages/libs/env/README.md)).
3. **Initialize Extensions** - When extensions' initialization code is being executed (i.e. register menu items,
	subscribe to states, sync with legacy APIs, etc.). 
4. **Initialize Application** - When the main application is being initialized (e.g. rendering the root component).
5. **React Standard Lifecycle** - From here and on, it's the standard [React lifecycle](https://react.dev/learn/lifecycle-of-reactive-effects) 
	you're familiar with.

## Monorepo

We've decided to use a monorepo structure, so all the packages are located in the same repository. This way, we can
easily share code between packages, and have a single CI/CD pipeline for all of them. The future plan is to expand this 
monorepo to contain all the public Elementor packages that are being published to NPM, so we have a single place to
share code across the company and publicly.

Read more about workspaces & monorepo:
- [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
- [Monorepo explained](https://monorepo.tools/)
- [Nx - Why monorepo?](https://nx.dev/more-concepts/why-monorepos)

### Structure & Naming Conventions

In order to make everything clear and easy to understand, we've decided that instead of having a flat folder structure
for all the packages, we'll organize them under the `/packages` folder by their domain (e.g. `/packages/core`, `/packages/libs`, etc.). This separation helps us understand which package belongs to which domain, and
to easily manage CI processes based on domain (i.e. run tests for all the packages in the `core` domain, or disallow
importing packages from the `pro` domain into the `core` domain). 

It's important to note that this separation is only for organizational purposes, and doesn't affect the package name or
the way it's being published to NPM. This means that every package can (theoretically) be moved between domains without 
breaking anything.

In addition, an extension package might have a prefix that indicates the application it extends (e.g. 
`@elementor/editor-app-bar`), because we might publish multiple packages under the same name to NPM (e.g. 
`@elementor/editor-app-bar` and `@elementor/dashboard-app-bar`), so we need to make sure that the package name is
unique. Accordingly, generic packages that are not specific to an application don't have a prefix (e.g.
`@elementor/locations`).

### Publish

Since we utilize a micro-frontend architecture, and the connections happen in runtime, we need to
ensure that extension developers are able to run our code and have the correct types on their IDEs while linting and
testing their code, rather than hoping that everything will work in runtime. Therefore, we're publishing the packages to
NPM with their TypeScript declarations for extension developers to use.

### Technical Stack

We use [TypeScript](https://www.typescriptlang.org/) & [ESLint](https://eslint.org/) for static analysis,
[Jest](https://jestjs.io/) for testing, [tsup](https://tsup.egoist.dev/) for transpiling, and
[Changesets](https://changesets-docs.vercel.app/) for publishing.

When choosing a monorepo management tool, we've tried [Nx](https://nx.dev/), but it was too complex for our needs,
so we've settled with [Turborepo](https://turbo.build/repo) as a simpler alternative for handling the task management and caching.

### Versioning

We're using [Semantic Versioning](https://semver.org/) to version the packages. The actual versioning & publishing is
being done by Changesets, which gives us a granular control about what's being published and when (compared to our
previous solution, Lerna, which was publishing on every merge to `main` and spammed the NPM registry & GitHub releases).

## Testing Framework

Currently, we don't have a testing framework for 3rd party developers to test their integrations with our code, but 
we're planning to add one in the future. In the meantime, we mock things manually in our internal packages.
