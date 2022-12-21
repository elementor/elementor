# Elementor packages

### Open issues
- [ ] Seems like `eslint` not working well.
- [x] Need to investigate how to use TS in the packages (share types between packages).
- [ ] Add coverage for jest.
- [ ] Tests for the exiting packages.

### Next phase Open Issues
- [ ] Each package should be declared in `editor-v2-config-provider.php` file
- [ ] The `test` and `build` scripts run all over the packages, it should be possible to run them on a specific package
- [ ] When executing `build` in the root plugin directory it doesn't build the packages.
- [ ] Need to investigate how to use `webpack` in the packages (externals, minified, babel-preset-env, babel in general, etc. ).
- [ ] Build should be inside the packages directory, and then copied to the plugin directory.

