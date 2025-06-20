# @elementor/editor-controls

## 1.1.0

### Minor Changes

- 9ccd243: Opacity control is added to the style tab
- 17b73ab: Update `@elementor/ui` version.
- aa176b8: Create a KeyValue Control
- 3daa1c9: Extract font family content list to a standalone component inside the Editor UI package.
- 40d00c2: Implement the Popover Menu List inside the Dynamic Tags and the Variables.
- d5e9011: Implement the Popover Search component inside the Dynamic Tags, Font Families and the Variables.
- 30a6d95: Added repeatable control type
- f37c325: Extract the popover scrollable content box to a standalone component inside the Editor UI package.
- 20d04f2: Added object position custom control

### Patch Changes

- Updated dependencies [da0c4ca]
- Updated dependencies [17b73ab]
- Updated dependencies [7a4178f]
- Updated dependencies [8e18905]
- Updated dependencies [3daa1c9]
- Updated dependencies [40d00c2]
- Updated dependencies [d5e9011]
- Updated dependencies [f37c325]
- Updated dependencies [20d04f2]
  - @elementor/editor-ui@0.12.0
  - @elementor/editor-props@0.14.0
  - @elementor/editor-elements@0.8.6

## 1.0.0

### Major Changes

- 2c11540: Added support for custom values in size control

### Minor Changes

- 199c99a: Added support to listen to breakpoint changes in the size-control

### Patch Changes

- Updated dependencies [ab6320c]
- Updated dependencies [2c11540]
  - @elementor/editor-props@0.13.0
  - @elementor/editor-elements@0.8.5

## 0.36.0

### Minor Changes

- ea5d3df: Export fontFamily components from editor-controls and editing-panel
- 80dbf43: Extract popover headers to a standalone component inside the Editor UI package.
- 6eeb59e: Disable controls panel labels by permission.

### Patch Changes

- af4e938: Add indicators to group headers
- Updated dependencies [80dbf43]
  - @elementor/editor-ui@0.11.0

## 0.35.0

### Minor Changes

- f7a59df: Split FontFamily UI into reusable components
- 4b762e0: add ControlActions to aspect ratio control

## 0.34.2

### Patch Changes

- Updated dependencies [9b6dbdd]
  - @elementor/editor-ui@0.10.1

## 0.34.1

### Patch Changes

- 8f3a61b: Floating action bar position change

## 0.34.0

### Minor Changes

- da38004: add size icon for Aspect Ratio control
- a8780f6: Extra top and bottom padding added to border radius and border width fields
- 3b2514c: update indication popover ui
- 03df0ff: Fixed floating actions background
- 0ed1947: Added control value reset functionality
- 2c5df45: Update `@elementor/icons` package.
- 010ba54: Disable style tab controls by user capability.

### Patch Changes

- 71835ef: Support style inheritance indicators in nested props controls
- Updated dependencies [2c5df45]
  - @elementor/editor-ui@0.10.0

## 0.33.0

### Minor Changes

- 67248fc: Move Aspect Ratio control to Collapse menu

## 0.32.0

### Minor Changes

- 93642ee: add new switch control for v4
- ae40ebe: Add an aspect ratio control to the styles size section
- 53a75e4: Fix the link value to be saved and restored properly

### Patch Changes

- 615baa1: upgrade elementor/ui version
- Updated dependencies [12fab9e]
- Updated dependencies [6e1d5ff]
- Updated dependencies [615baa1]
  - @elementor/editor-ui@0.9.0
  - @elementor/editor-current-user@0.5.0

## 0.31.0

### Minor Changes

- 7c8df3b: Fix color picker to open aligned with the overlay popover.
- 97fbdf0: Add keyboard-based unit switching to size control

### Patch Changes

- 27c4c1f: Added a separated style inheritance indicator to background-color
- Updated dependencies [89dfaf2]
- Updated dependencies [27c4c1f]
  - @elementor/editor-current-user@0.4.0
  - @elementor/editor-props@0.12.1
  - @elementor/editor-elements@0.8.4

## 0.30.1

### Patch Changes

- Updated dependencies [bde1731]
  - @elementor/editor-ui@0.8.2
  - @elementor/editor-elements@0.8.3

## 0.30.0

### Minor Changes

- be87c6e: null-check was missing, causing possible crash in the box-shadow control
- d05046f: Add replaceable location

### Patch Changes

- Updated dependencies [d05046f]
  - @elementor/locations@0.8.0

## 0.29.0

### Minor Changes

- ebcf7cc: Prevent redundant on-change trigger, remove tooltip from menu items, render label as content
- 71d9ffe: Added support for split items in toggle button group and an API for checking if an experiment is active
- 810db8d: Removed characters added by mistake
- b150c2b: Wrap font family with Control Action

## 0.28.2

### Patch Changes

- a1d7b3b: Added configurable layout and top divider for controls in settings
- Updated dependencies [a1d7b3b]
- Updated dependencies [3ccc78c]
  - @elementor/editor-elements@0.8.2
  - @elementor/http-client@0.3.0
  - @elementor/editor-current-user@0.3.2

## 0.28.1

### Patch Changes

- 7daaa99: Rename `http` package to `http-client`
- Updated dependencies [7daaa99]
  - @elementor/http-client@0.2.0
  - @elementor/editor-current-user@0.3.1

## 0.28.0

### Minor Changes

- f4deb05: Remove divider in Link Control and change Image Control showcases
- 9e7a3ee: Set Link Control label default empty string
- baf662e: Fixed when opening and closing link collapsible, publish will not activate

### Patch Changes

- ca016cc: Elementor ui update to version 1.34.2, elementor icons update to 1.40.1
- Updated dependencies [ca016cc]
  - @elementor/editor-ui@0.8.1

## 0.27.0

### Minor Changes

- 093b7ca: Add support for multiple control replacements
- 10cbbe9: update `@elementor/ui` version

### Patch Changes

- Updated dependencies [10cbbe9]
  - @elementor/editor-ui@0.8.0

## 0.26.0

### Minor Changes

- 0ab4b84: Alignment for the controls (right-side) settings & styles tabs

## 0.25.0

### Minor Changes

- bba6b02: Ignore restricted characters in number inputs
- a27cc75: Style tab layout section show correct display value
- 6a882a0: autofocus on font family popup search input
- fd5251c: Add prop validation to required fields.

### Patch Changes

- 03dad77: Rename "defaultValue" to "placeholder" on bound prop context
- Updated dependencies [5fa575c]
- Updated dependencies [044815b]
- Updated dependencies [fe0ab45]
- Updated dependencies [fd5251c]
  - @elementor/editor-elements@0.8.1
  - @elementor/editor-ui@0.7.1
  - @elementor/editor-props@0.12.0

## 0.24.0

### Minor Changes

- f644084: Added a "take me there" button in link-in-link restriction info-tip

### Patch Changes

- e1bbdf1: Reset repeater item open on mount state.
- 3973dda: Disable "open in new page" switcher when link control has no value
- f045ee0: Fix repeaters color and box shadow color indication
- 830012f: Fix background image overlay label item
- babfa1c: Center font control select items
- Updated dependencies [f644084]
  - @elementor/editor-elements@0.8.0
  - @elementor/editor-ui@0.7.0

## 0.23.0

### Minor Changes

- ad1f2ff: Update unit size text color to secondary

## 0.22.0

### Minor Changes

- 548209b: Add link restriction infotip

### Patch Changes

- Updated dependencies [fdfc87a]
- Updated dependencies [548209b]
  - @elementor/editor-ui@0.6.0
  - @elementor/editor-elements@0.7.1

## 0.21.0

### Minor Changes

- 951d633: Add styles inheritance indicator next to each control label in the style tab

### Patch Changes

- 666ffdd: Change theme provider styles for editing panel and class manager panel
- Updated dependencies [666ffdd]
  - @elementor/editor-ui@0.5.1

## 0.20.0

### Minor Changes

- 2ea9555: Enhanced link restriction functionality and moved to editor-elements package
- 50938e4: Change controls menus text style
- 64ec032: Change the style from 'ListSubHeader' to 'MenuSubHeader'

### Patch Changes

- Updated dependencies [2ea9555]
- Updated dependencies [50938e4]
  - @elementor/editor-elements@0.7.0
  - @elementor/editor-ui@0.5.0

## 0.19.1

### Patch Changes

- 3e108d9: update elementor/ui
- Updated dependencies [593f222]
  - @elementor/editor-elements@0.6.6

## 0.19.0

### Minor Changes

- 869906f: Allow the user to publish the page after clicking one of the linked buttons

### Patch Changes

- 8523f8c: Updated tabs styles
- Updated dependencies [5387bcf]
- Updated dependencies [efd54a9]
  - @elementor/editor-elements@0.6.5
  - @elementor/editor-props@0.11.1

## 0.18.1

### Patch Changes

- 85facff: Set fixed max-width for toggle-buttons-group item.
- e67bdcb: Update control label spacing.

## 0.18.0

### Minor Changes

- 217d896: Add indicators to control labels to reflect the style inheritance.

### Patch Changes

- Updated dependencies [14610ee]
  - @elementor/editor-elements@0.6.4

## 0.17.0

### Minor Changes

- 0ed25f2: Reorder font categories in font family control
- dcfcd9f: Move editor-current-user package to libs, added user capabilities usage in svg control
- 91aa1eb: Open dialog when trying to upload svg with enable unfiltered uploads disabled
- 16453f0: Add a space before the font name in the list of the font family menu
- d8bc786: consistent dimension controls
- 6f36e05: Update background gradient test
- 7cf5003: mitigating extra paddings for (sortable) repeater items
- 3e9ffb0: Open repeater item's popover on add.
- 8231e7c: Added logic to block adding anchor/link to elements nested in or containing an already an anchored element
- c002cba: Change background color overlay shape to support variables
- 353031f: Refactored text decoration field with additional options and updated toggle control for non-exclusive selection.
- 1748439: Fix default background gradient color stop

### Patch Changes

- Updated dependencies [1e2dfa0]
- Updated dependencies [b8a7725]
- Updated dependencies [dcfcd9f]
- Updated dependencies [4c2935b]
- Updated dependencies [8231e7c]
- Updated dependencies [19f5dfe]
- Updated dependencies [c002cba]
- Updated dependencies [51432b9]
- Updated dependencies [070b92c]
  - @elementor/editor-current-user@0.3.0
  - @elementor/wp-media@0.6.0
  - @elementor/editor-props@0.11.0
  - @elementor/editor-elements@0.6.3

## 0.16.0

### Minor Changes

- 7d37fc1: Add background gradient overlay control
- 788208d: Change font control not found modal content

### Patch Changes

- Updated dependencies [7d37fc1]
  - @elementor/editor-props@0.10.0

## 0.15.0

### Minor Changes

- a654cb2: Update `@elementor/icons` version
- f99d23c: Add missing tooltips for style controls
- f6a4d4f: add API client and hooks for enabling unfiltered files upload

### Patch Changes

- 23458d1: Make atomic controls use Logical Properties
- cab4ddf: Improve Font Family control performance
- Updated dependencies [23458d1]
- Updated dependencies [f6a4d4f]
  - @elementor/editor-props@0.9.4
  - @elementor/wp-media@0.5.0
  - @elementor/http-client@0.1.4

## 0.14.0

### Minor Changes

- 1a1e998: Add auto size unit to size controls
- bcf4254: VQA text fixes
- ed5962d: removed transparency during, to prevent ui glitches while using drag-n-drop to re-order repeater nodes

### Patch Changes

- f4b76ac: cannot link values once you unlinked them when input is empty
- 571ff75: Add `debounce` util
- Updated dependencies [c654f89]
- Updated dependencies [571ff75]
  - @elementor/editor-props@0.9.3
  - @elementor/utils@0.4.0
  - @elementor/wp-media@0.4.2

## 0.13.0

### Minor Changes

- 33de95b: allow users to manually re-order repeater nodes

## 0.12.1

### Patch Changes

- 164759c: Allow text to auto grows w/o scrollbar

## 0.12.0

### Minor Changes

- 927578f: The creation of a popover grid container component.
- 0acbc6a: Fixed input startIcon color
- 10651bb: The creation of a popover content component.
- 1db202a: The creation of a styled panel stack component.

## 0.11.0

### Minor Changes

- 35092ea: Fixed strings to sentence case
- 2da724c: Fix input width changing, according to selection
- cf83fe4: Updated link control to save null instead of empty string, to allow it to pass validation, and re-add support of dynamic tags

### Patch Changes

- Updated dependencies [728ffb5]
  - @elementor/editor-props@0.9.2

## 0.10.0

### Minor Changes

- 87fa083: Preserve background repeater value history when switching tabs.

### Patch Changes

- Updated dependencies [6b064c5]
  - @elementor/editor-props@0.9.1

## 0.9.0

### Minor Changes

- c9133d7: Add background image overlay custom size
- 86863c1: Changed link control to use query instead of autocomplete
- 910044c: update `@elementor/icons` and `@elementor/ui` packages.
- 9a41a86: Added condition to hide select control for tag bind when link is enabled
- 9de8ba7: Updated icon in background repeater image overlay size control
- 0953b40: Background image overlay resolution canvas connection
- 6680c92: added svg widget
- 15c964f: Add background image overlay custom position
- 5caf78d: update `@elementor/ui` package.
- 625448d: Added tests for background image overlay
- c162e6c: Update '@elementor/icons' version
- d39b70b: Add a new repeater item to top by default.
- 9cc8def: Updated image upload control text
- fbf6203: Added select button for SVG control and updated component style
- ceb1211: remove extra padding from popover header

### Patch Changes

- 9fd9bae: align background image overlay repeat and attachment controls.
- da38fa9: Remove unused exports and add missing dependencies.
- 35f9714: Add default background image to background overlay repeater
- 2bf6b34: fix, add file type to the image name in the background overlay
- b4a6ac6: refactor the call to editor controls env, to avoid parsing env before it's initialized
- e76d970: Added SVG upload text
- baee3f3: Adjust gap
- Updated dependencies [c9133d7]
- Updated dependencies [86863c1]
- Updated dependencies [da38fa9]
- Updated dependencies [9ca4eab]
- Updated dependencies [15c964f]
  - @elementor/editor-props@0.9.0
  - @elementor/utils@0.3.1
  - @elementor/wp-media@0.4.1

## 0.8.0

### Minor Changes

- 4fbe12c: Update `@elementor/icons` version.

### Patch Changes

- 6c4d4a7: refactored CSS class menu and fix it's keyboard navigation

## 0.7.0

### Minor Changes

- 51a5ab9: Remove empty prop value in select control.
- 27f5860: Add background image overlay repeat control
- e3c4a37: Update the order of background repeater image controls.
- f1a2ffb: Change gap control prop type.
- 4d1fd00: Add background overlay popover image tab
- 1bec508: Added background image overlay size control
- 99fccc1: Updated icons in background repeater image overlay size control and elementor-icons version
- 5829b05: fix autocomplete control events handling
- 554a6ce: Add Background Image Resolution
- f25fc07: Add background image attachment control
- 7b499aa: Add Background Position control.

### Patch Changes

- d90521a: Remove mixed placeholder in `EqualUnequalControl` input with empty values.
- a2f5096: support restricting uploaded image type
- aa5ab2b: Change floating bar location in image media control.
- cfbd198: Update `@elementor/ui` version
- Updated dependencies [a2f5096]
- Updated dependencies [af5fa42]
- Updated dependencies [f1a2ffb]
  - @elementor/wp-media@0.4.0
  - @elementor/editor-props@0.8.0

## 0.6.1

### Patch Changes

- bd1b038: Change text for Mixed state
- 4e5ea74: support SVG upload
- 7582ba6: Modify linked dimensions control functionality
- 7654921: Allow any strings in link control
- Updated dependencies [4e5ea74]
- Updated dependencies [7582ba6]
- Updated dependencies [7654921]
  - @elementor/wp-media@0.3.0
  - @elementor/editor-props@0.7.1

## 0.6.0

### Minor Changes

- 45038fc: Added background image overlay control
- e742340: Revert background overlay control unneeded change
- dab01fd: Created an autocomplete control and extended link control.
- 43f1684: Save previous link value in session
- 499c531: Add binds path to prop context.

### Patch Changes

- Updated dependencies [45038fc]
- Updated dependencies [43f1684]
  - @elementor/editor-props@0.7.0
  - @elementor/session@0.1.0

## 0.5.0

### Minor Changes

- a2245c5: Change prop provider infra to support nested props.

### Patch Changes

- 5fc8d7b: Removed extra prop provider from background control.
- Updated dependencies [a2245c5]
  - @elementor/editor-props@0.6.0

## 0.4.1

### Patch Changes

- 6a3622a: background infra changes
- Updated dependencies [6a3622a]
  - @elementor/editor-props@0.5.1

## 0.4.0

### Minor Changes

- 3019657: Add render control test util.
- 2653cf0: Pass empty string to control input null values.
- 862178c: Set mixed border value properly from empty initial state.

## 0.3.1

### Patch Changes

- a0ca1d8: fixed an issue where persisting dimensions values behaved unpredictably when switching breakpoints

## 0.3.0

### Minor Changes

- ff35b95: Added Gaps field with a control, proptype and a transformer

### Patch Changes

- Updated dependencies [8943189]
- Updated dependencies [ff35b95]
  - @elementor/editor-props@0.5.0

## 0.2.0

### Minor Changes

- c393288: Remove support for shorthand prop values.
- bc728b7: Add type and validation support to `useBoundProp`

### Patch Changes

- 91453b3: Update and lock dependencies versions
- Updated dependencies [c393288]
- Updated dependencies [bc728b7]
- Updated dependencies [91453b3]
  - @elementor/editor-props@0.4.0
  - @elementor/wp-media@0.2.3

## 0.1.1

### Patch Changes

- 1926fe1: Update dependencies

## 0.1.0

### Minor Changes

- e4c6e3b: update @elementor/ui version
  fix color picker position in box shadow repeater control
  make the color control full width
- 00bdd7e: Added layout section with display field, updated toggle button group to match new children elements
- cecdfba: Updated display field with a flex option, together with a "justify content" field
- 6d5475d: Show spinner in image media control `CardMedia` on initial fetch.
- 55962f8: Add background color overlay control
- e2ee013: Created the `editor-controls` packages.

### Patch Changes

- 7781969: Update `@elementor/ui` version
- 5c3d546: Fix some style issues in the editing panel and controls
- Updated dependencies [6e240a8]
  - @elementor/editor-props@0.3.0
  - @elementor/wp-media@0.2.2
