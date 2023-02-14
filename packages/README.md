# Elementor packages

### Open Issues
- [ ] Each package should be declared in `editor-v2-config-provider.php` file
- [ ] The `test` and `build` scripts run all over the packages, it should be possible to run them on a specific package
- [ ] When executing `build` in the root plugin directory it doesn't build the packages.
- [ ] Need to investigate how to use `webpack` in the packages.
  - babel-preset-env
  - babel-runtime
  - webpack runtime
  - webpack remove empty chunks (type chunks)
- [ ] Build should be inside the packages directory, and then copied to the plugin directory.
- [ ] We need to think about sharing locations between packages (Support class component, error boundary).
- [ ] Enforce boundaries between packages (e.g. `top-bar` shouldn't be used in `locations`) (https://github.com/javierbrea/eslint-plugin-boundaries).
- [ ] Run the editor without WordPress
