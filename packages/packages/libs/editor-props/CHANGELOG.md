# @elementor/editor-props

## 1.50.0

### Minor Changes

- 91c12ca: Adds contrast, gray-scale, invert, sepia and saturate css filters
- 91c12ca: Updated size control to support degree units

### Patch Changes

- 91c12ca: Update dependencies SDK to skip invalid values.
  - @elementor/schema@1.50.0

## 0.17.0

### Minor Changes

- 068f659: Adds contrast, gray-scale, invert, sepia and saturate css filters
- e7cca0a: Updated size control to support degree units

### Patch Changes

- 07ca7e9: Update dependencies SDK to skip invalid values.

## 0.16.0

### Minor Changes

- b3726f6: Add transform move control
- c62d64c: Injected prop dependency API into settings field

## 0.15.0

### Minor Changes

- ab6ad10: Adds support for css filter property, blur and brightness only.
- ea388a1: Added support for dependencies between props

## 0.14.0

### Minor Changes

- 20d04f2: Added object position custom control

## 0.13.0

### Minor Changes

- ab6320c: Background image support dynamic tag
- 2c11540: Added support for custom values in size control

## 0.12.1

### Patch Changes

- 27c4c1f: Added a separated style inheritance indicator to background-color

## 0.12.0

### Minor Changes

- fe0ab45: Filter empty values from props when constructing styles inheritance snapshots
- fd5251c: Add prop validation to required fields.

## 0.11.1

### Patch Changes

- efd54a9: Add fallback transformer to the transformers registry

## 0.11.0

### Minor Changes

- 4c2935b: Added support to atomic elements for command "document/elements/reset-style"
- c002cba: Change background color overlay shape to support variables

## 0.10.0

### Minor Changes

- 7d37fc1: Add background gradient overlay control

## 0.9.4

### Patch Changes

- 23458d1: Make atomic controls use Logical Properties

## 0.9.3

### Patch Changes

- c654f89: Improve `createTransformer` types

## 0.9.2

### Patch Changes

- 728ffb5: Add the ability to extend transformers

## 0.9.1

### Patch Changes

- 6b064c5: Make atomic border radius control use logical properties

## 0.9.0

### Minor Changes

- c9133d7: Add background image overlay custom size
- 86863c1: Changed link control to use query instead of autocomplete
- 15c964f: Add background image overlay custom position

### Patch Changes

- da38fa9: Remove unused exports and add missing dependencies.

## 0.8.0

### Minor Changes

- f1a2ffb: Change gap control prop type.

## 0.7.1

### Patch Changes

- 7582ba6: Modify linked dimensions control functionality
- 7654921: Allow any strings in link control

## 0.7.0

### Minor Changes

- 45038fc: Added background image overlay control
- 43f1684: Save previous link value in session

## 0.6.0

### Minor Changes

- a2245c5: Change prop provider infra to support nested props.

## 0.5.1

### Patch Changes

- 6a3622a: background infra changes

## 0.5.0

### Minor Changes

- ff35b95: Added Gaps field with a control, proptype and a transformer

### Patch Changes

- 8943189: Refactor canvas styles rendering

## 0.4.0

### Minor Changes

- c393288: Remove support for shorthand prop values.
- bc728b7: Add type and validation support to `useBoundProp`

### Patch Changes

- 91453b3: Update and lock dependencies versions

## 0.3.0

### Minor Changes

- 6e240a8: Adjust the prop type utils to support empty values.

## 0.2.0

### Minor Changes

- 6cf7ba1: Change controls naming
- e69bdae: Created the `editor-props` and `editor-styles` packages.
- bf12c4d: Moved all prop type utils to the `editor-props` package.

### Patch Changes

- Updated dependencies [9abdfaf]
  - @elementor/schema@0.1.2
