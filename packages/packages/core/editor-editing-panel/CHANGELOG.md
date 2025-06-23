# Change Log

## 1.47.0

### Minor Changes

- ab6ad10: Adds support for css filter property, blur and brightness only.
- a0ff6bc: Reset value button position fix, input reset fix for aspect ratio control
- bfe6b0b: Update the width settings for the popover selection list.
- 16df763: Add changed prop name to atomic element setting history
- 6c6f0d6: Standardize style field layout and add `propDisplayName` prop to `StylesField`
- 125de7b: Show placeholders in Number control
- c694e33: updated overlay styling for small elements
  changed default tab for editing panel for divider widget
- d85ca8c: Update the popover styling for version 3.30.

### Patch Changes

- e953081: add search in css classes list
  create useDebounceState in util
- 9cf0fad: Show styles inheritance indicator even if all inherited values are from the base style
- 668adb4: Adds a panel divider to css filter effects section
- Updated dependencies [e953081]
- Updated dependencies [ab6ad10]
- Updated dependencies [0b32e5c]
- Updated dependencies [c91168a]
- Updated dependencies [a0ff6bc]
- Updated dependencies [bfe6b0b]
- Updated dependencies [ea388a1]
- Updated dependencies [16df763]
- Updated dependencies [6c6f0d6]
- Updated dependencies [125de7b]
- Updated dependencies [9bbd4e3]
- Updated dependencies [c694e33]
- Updated dependencies [d85ca8c]
  - @elementor/utils@0.5.0
  - @elementor/editor-controls@1.2.0
  - @elementor/editor-canvas@0.25.0
  - @elementor/editor-props@0.15.0
  - @elementor/editor-ui@0.13.0
  - @elementor/editor-elements@0.8.7
  - @elementor/editor-documents@0.13.8
  - @elementor/editor-styles-repository@0.10.4
  - @elementor/editor-v1-adapters@0.12.1
  - @elementor/wp-media@0.6.1
  - @elementor/editor-styles@0.6.11
  - @elementor/editor@0.20.1
  - @elementor/editor-panels@0.16.1
  - @elementor/editor-responsive@0.13.6

## 1.46.0

### Minor Changes

- 9ccd243: Opacity control is added to the style tab
- ac09e27: Update `useStylesFields` api.
- 17b73ab: Update `@elementor/ui` version.
- 7a4178f: Remove alert custom styling.
- 40d00c2: Implement the Popover Menu List inside the Dynamic Tags and the Variables.
- d5e9011: Implement the Popover Search component inside the Dynamic Tags, Font Families and the Variables.
- 93dfad1: Update `PopoverAction` to render dynamic content.
- 30a6d95: Added repeatable control type
- f37c325: Extract the popover scrollable content box to a standalone component inside the Editor UI package.
- 20d04f2: Added object position custom control

### Patch Changes

- 29f1740: Handle provider-to-color logic from the style providers directly
- Updated dependencies [9ccd243]
- Updated dependencies [da0c4ca]
- Updated dependencies [17b73ab]
- Updated dependencies [7a4178f]
- Updated dependencies [29f1740]
- Updated dependencies [8e18905]
- Updated dependencies [aa176b8]
- Updated dependencies [3daa1c9]
- Updated dependencies [40d00c2]
- Updated dependencies [d5e9011]
- Updated dependencies [30a6d95]
- Updated dependencies [f37c325]
- Updated dependencies [20d04f2]
  - @elementor/editor-controls@1.1.0
  - @elementor/editor-ui@0.12.0
  - @elementor/editor-canvas@0.24.0
  - @elementor/editor-panels@0.16.0
  - @elementor/editor@0.20.0
  - @elementor/editor-styles-repository@0.10.3
  - @elementor/editor-props@0.14.0
  - @elementor/editor-documents@0.13.7
  - @elementor/editor-elements@0.8.6
  - @elementor/editor-styles@0.6.10

## 1.45.0

### Minor Changes

- ab6320c: Background image support dynamic tag
- dac8026: Fix style controls layout for mixed UI and site language directions
- 2c11540: Added support for custom values in size control

### Patch Changes

- Updated dependencies [ab6320c]
- Updated dependencies [199c99a]
- Updated dependencies [2c11540]
  - @elementor/editor-props@0.13.0
  - @elementor/editor-controls@1.0.0
  - @elementor/editor-canvas@0.23.0
  - @elementor/editor-styles-repository@0.10.2
  - @elementor/editor-elements@0.8.5
  - @elementor/editor-styles@0.6.9

## 1.44.0

### Minor Changes

- ea5d3df: Export fontFamily components from editor-controls and editing-panel
- 80dbf43: Extract popover headers to a standalone component inside the Editor UI package.
- 6eeb59e: Disable controls panel labels by permission.

### Patch Changes

- af4e938: Add indicators to group headers
- a0af69a: Display the floating Clear button above the control.
- Updated dependencies [56b4348]
- Updated dependencies [ea5d3df]
- Updated dependencies [80dbf43]
- Updated dependencies [6eeb59e]
- Updated dependencies [af4e938]
  - @elementor/editor-canvas@0.22.3
  - @elementor/editor-controls@0.36.0
  - @elementor/editor-ui@0.11.0

## 1.43.1

### Patch Changes

- Updated dependencies [f7a59df]
- Updated dependencies [4b762e0]
  - @elementor/editor-controls@0.35.0

## 1.43.0

### Minor Changes

- 1edd821: Add history for class creation

### Patch Changes

- a3ba5ef: Prevent inline class rename based on user capability.
- 9b6dbdd: Update class selector capabilities texts.
- 7feedb4: Enable normal state by default.
- Updated dependencies [9b6dbdd]
  - @elementor/editor-ui@0.10.1
  - @elementor/editor-controls@0.34.2

## 1.42.0

### Minor Changes

- e732d81: Show Tooltip on hover and Infotip on click for style indicator.
- 8dca168: Prevent scrolling when the Indication Popover has been opened.

### Patch Changes

- cd4c3fe: Remove duplicated object fit set value.
- b7369f2: Update the chip color inside the Indication Popover.
- Updated dependencies [8f3a61b]
  - @elementor/editor-controls@0.34.1

## 1.41.0

### Minor Changes

- 3b2514c: update indication popover ui
- 34ec021: Update the clear icon in the reset floating action
- 0ed1947: Added control value reset functionality
- 2c5df45: Update `@elementor/icons` package.
- 010ba54: Disable style tab controls by user capability.

### Patch Changes

- 71835ef: Support style inheritance indicators in nested props controls
- 5b20079: Fix is-modified status not updated on class apply/unapply
- 7b0d10d: Show complex control values in styles inheritance popover
- 3725856: Initial style sections to be closed by default
- 688d69e: Fix class item remove button condition.
- Updated dependencies [71835ef]
- Updated dependencies [7b0d10d]
- Updated dependencies [da38004]
- Updated dependencies [a8780f6]
- Updated dependencies [3b2514c]
- Updated dependencies [03df0ff]
- Updated dependencies [0957941]
- Updated dependencies [0ed1947]
- Updated dependencies [2c5df45]
- Updated dependencies [010ba54]
  - @elementor/editor-controls@0.34.0
  - @elementor/editor-canvas@0.22.2
  - @elementor/editor-styles-repository@0.10.1
  - @elementor/editor-ui@0.10.0

## 1.40.0

### Minor Changes

- 67248fc: Move Aspect Ratio control to Collapse menu

### Patch Changes

- 120cc05: Fix css class selector empty state issues.
- Updated dependencies [67248fc]
  - @elementor/editor-controls@0.33.0

## 1.39.0

### Minor Changes

- 93642ee: add new switch control for v4
- ab07642: Auto select the last selected class (per-element), when applicable.
- 12fab9e: Show info tip for disabled class items.
- 6e1d5ff: Enforce capabilities on global classes.
- d80a316: Added history for classes apply & remove
- ae40ebe: Add an aspect ratio control to the styles size section

### Patch Changes

- 35cdc76: Fix rendering zero under columns field in typography.
- 615baa1: upgrade elementor/ui version
- Updated dependencies [93642ee]
- Updated dependencies [12fab9e]
- Updated dependencies [6e1d5ff]
- Updated dependencies [615baa1]
- Updated dependencies [ae40ebe]
- Updated dependencies [53a75e4]
  - @elementor/editor-controls@0.32.0
  - @elementor/editor-ui@0.9.0
  - @elementor/editor-styles-repository@0.10.0
  - @elementor/editor-current-user@0.5.0
  - @elementor/editor-canvas@0.22.1
  - @elementor/editor-panels@0.15.4
  - @elementor/editor@0.19.4
  - @elementor/editor-documents@0.13.6

## 1.38.1

### Patch Changes

- 27c4c1f: Added a separated style inheritance indicator to background-color
- Updated dependencies [7c8df3b]
- Updated dependencies [15450a8]
- Updated dependencies [89dfaf2]
- Updated dependencies [97fbdf0]
- Updated dependencies [27c4c1f]
  - @elementor/editor-controls@0.31.0
  - @elementor/editor-styles-repository@0.9.0
  - @elementor/editor-canvas@0.22.0
  - @elementor/editor-current-user@0.4.0
  - @elementor/editor-props@0.12.1
  - @elementor/editor-elements@0.8.4
  - @elementor/editor-styles@0.6.8

## 1.38.0

### Minor Changes

- d16f1c5: Add 'Columns' control to the 'Typography' section inside the style tab

## 1.37.0

### Minor Changes

- 5bc69ec: Add 'Object fit' control into the 'Size' section under the Style tab
- 7805cd5: useElementByState is behind feature flag

## 1.36.0

### Minor Changes

- 7439d73: extract `isExperimentActive` to `@elementor/editor-v1-adapters`

### Patch Changes

- bde1731: Change the error component of class rename field
- Updated dependencies [bde1731]
- Updated dependencies [7439d73]
  - @elementor/editor-ui@0.8.2
  - @elementor/editor-v1-adapters@0.12.0
  - @elementor/editor-controls@0.30.1
  - @elementor/editor@0.19.3
  - @elementor/editor-canvas@0.21.3
  - @elementor/editor-panels@0.15.3
  - @elementor/editor-styles-repository@0.8.8
  - @elementor/editor-elements@0.8.3
  - @elementor/editor-responsive@0.13.5
  - @elementor/editor-styles@0.6.7

## 1.35.0

### Minor Changes

- 398d703: Adding stateful memory for selected panels/sections/tabs

### Patch Changes

- Updated dependencies [be87c6e]
- Updated dependencies [d05046f]
  - @elementor/editor-controls@0.30.0
  - @elementor/locations@0.8.0
  - @elementor/editor@0.19.2
  - @elementor/editor-panels@0.15.2
  - @elementor/menus@0.1.5
  - @elementor/editor-canvas@0.21.2

## 1.34.0

### Minor Changes

- 71d9ffe: Added support for split items in toggle button group and an API for checking if an experiment is active
- 4a2569f: Replaced experiment status check to look for existing experiments
- 9f16dcb: Added an API to get experimental features' status
- b150c2b: Wrap font family with Control Action

### Patch Changes

- 9a098c5: Add a general experiment for 3.30
- Updated dependencies [ebcf7cc]
- Updated dependencies [71d9ffe]
- Updated dependencies [b6131c3]
- Updated dependencies [810db8d]
- Updated dependencies [b150c2b]
  - @elementor/editor-controls@0.29.0
  - @elementor/editor-styles-repository@0.8.7
  - @elementor/editor-canvas@0.21.1

## 1.33.1

### Patch Changes

- 6dc8be2: Hide anchor offset control behind CSS ID experiment
- Updated dependencies [f59eac2]
  - @elementor/editor-canvas@0.21.0

## 1.33.0

### Minor Changes

- a1d7b3b: Added configurable layout and top divider for controls in settings

### Patch Changes

- Updated dependencies [a1d7b3b]
  - @elementor/editor-controls@0.28.2
  - @elementor/editor-elements@0.8.2
  - @elementor/editor-canvas@0.20.1
  - @elementor/editor-styles-repository@0.8.6
  - @elementor/editor-current-user@0.3.2

## 1.32.0

### Minor Changes

- 6984b75: Create Style Indication Infotip.

### Patch Changes

- Updated dependencies [7daaa99]
- Updated dependencies [6984b75]
  - @elementor/editor-current-user@0.3.1
  - @elementor/editor-controls@0.28.1
  - @elementor/editor-canvas@0.20.0

## 1.31.0

### Minor Changes

- 233825c: Add scroll offset control to styles tab
- 18741b8: Add sticky header to Panel

### Patch Changes

- ca016cc: Elementor ui update to version 1.34.2, elementor icons update to 1.40.1
- ca5d620: CSS class selector: Display validation error message
- Updated dependencies [f4deb05]
- Updated dependencies [9e7a3ee]
- Updated dependencies [ca016cc]
- Updated dependencies [baf662e]
- Updated dependencies [ca5d620]
  - @elementor/editor-controls@0.28.0
  - @elementor/editor-canvas@0.19.1
  - @elementor/editor-panels@0.15.1
  - @elementor/editor-ui@0.8.1
  - @elementor/editor@0.19.1
  - @elementor/editor-styles-repository@0.8.5

## 1.30.0

### Minor Changes

- 10cbbe9: update `@elementor/ui` version
- 97e4d7d: create `editor-variables` package

### Patch Changes

- 093b7ca: Add support for multiple control replacements
- 5f348b8: Allow self icons to be rotated by the ancestor value
- baa9d17: Show dynamic settings actions when popover is open
- Updated dependencies [093b7ca]
- Updated dependencies [10cbbe9]
- Updated dependencies [ce1852b]
  - @elementor/editor-controls@0.27.0
  - @elementor/editor-canvas@0.19.0
  - @elementor/editor-panels@0.15.0
  - @elementor/editor-ui@0.8.0
  - @elementor/editor@0.19.0

## 1.29.2

### Patch Changes

- 212075b: Fix class selector chip line height.

## 1.29.1

### Patch Changes

- ee3cb2b: Rename css selector placeholder

## 1.29.0

### Minor Changes

- 0ab4b84: Alignment for the controls (right-side) settings & styles tabs
- 3afb048: Add background to multi-combobox group header in css class selector

### Patch Changes

- Updated dependencies [0ab4b84]
- Updated dependencies [2b77932]
  - @elementor/editor-controls@0.26.0
  - @elementor/editor-canvas@0.18.1

## 1.28.0

### Minor Changes

- a53f563: Remove spacing and fix the title of css classes
- 2125601: Fix editing panel is breaking on styles undo when style is empty
- a27cc75: Style tab layout section show correct display value
- fe0ab45: Filter empty values from props when constructing styles inheritance snapshots

### Patch Changes

- 93d3e45: Fix css class menu focus-visible inconsistency
- 42c42ee: Remove side-effects
- 5fa575c: Fix when switching documents it removes all the previous document styles
- 03dad77: Rename "defaultValue" to "placeholder" on bound prop context
- 64574e3: Refactor styles provider as a preparation for header/footer styles not being rendered
- 14d8b08: Show placeholder in empty class selector.
- Updated dependencies [f9d5d33]
- Updated dependencies [bba6b02]
- Updated dependencies [42c42ee]
- Updated dependencies [5fa575c]
- Updated dependencies [03dad77]
- Updated dependencies [a27cc75]
- Updated dependencies [6a882a0]
- Updated dependencies [044815b]
- Updated dependencies [64574e3]
- Updated dependencies [fe0ab45]
- Updated dependencies [fd5251c]
  - @elementor/editor-canvas@0.18.0
  - @elementor/editor-controls@0.25.0
  - @elementor/editor-styles-repository@0.8.4
  - @elementor/editor-panels@0.14.1
  - @elementor/editor@0.18.6
  - @elementor/editor-elements@0.8.1
  - @elementor/editor-ui@0.7.1
  - @elementor/editor-props@0.12.0
  - @elementor/editor-styles@0.6.6

## 1.27.0

### Minor Changes

- 9b5e475: border control icons are messed up when flex direction changes
- 94aa98c: text alignment icons are affected by flex direction

### Patch Changes

- 02fd724: Remove styles inheritance indicator if all inherited values are from a base style provider
- 13cc0d0: Fixed overflow in general tab for image widget
- c6937f8: Flex size field creates multiple local classes
- Updated dependencies [f82191d]
- Updated dependencies [e1bbdf1]
- Updated dependencies [02fd724]
- Updated dependencies [3973dda]
- Updated dependencies [f045ee0]
- Updated dependencies [3822513]
- Updated dependencies [830012f]
- Updated dependencies [babfa1c]
- Updated dependencies [f644084]
  - @elementor/editor-canvas@0.17.0
  - @elementor/editor-controls@0.24.0
  - @elementor/editor-styles-repository@0.8.3
  - @elementor/editor-responsive@0.13.4
  - @elementor/editor-elements@0.8.0
  - @elementor/editor-ui@0.7.0
  - @elementor/editor-styles@0.6.5

## 1.26.1

### Patch Changes

- 8b40d87: Editing panel tabs styles update
- Updated dependencies [ad1f2ff]
  - @elementor/editor-controls@0.23.0

## 1.26.0

### Minor Changes

- b31a032: Add dynamic support in client dom rendering

### Patch Changes

- Updated dependencies [b31a032]
  - @elementor/editor-canvas@0.16.1

## 1.25.0

### Minor Changes

- fdfc87a: Classes and selector UI updates.

### Patch Changes

- 33bc54d: Add indication on styled states in the css class menu
- Updated dependencies [fdfc87a]
- Updated dependencies [548209b]
  - @elementor/editor-ui@0.6.0
  - @elementor/editor-controls@0.22.0
  - @elementor/editor-elements@0.7.1
  - @elementor/editor-styles-repository@0.8.2

## 1.24.0

### Minor Changes

- c262b65: Update justify-content control to work with flex values
- 951d633: Add styles inheritance indicator next to each control label in the style tab
- 311ff8e: Fix the spacing of the Dynamic tags menu
- 67f2795: Fix Dynamic tags are not displayed

### Patch Changes

- 666ffdd: Change theme provider styles for editing panel and class manager panel
- Updated dependencies [951d633]
- Updated dependencies [666ffdd]
- Updated dependencies [7aaf98f]
  - @elementor/editor-controls@0.21.0
  - @elementor/editor-ui@0.5.1
  - @elementor/editor@0.18.5
  - @elementor/editor-panels@0.14.0

## 1.23.0

### Minor Changes

- c10d154: Change outer margin of dynamic tags popover
- 50938e4: Change controls menus text style
- 64ec032: Change the style from 'ListSubHeader' to 'MenuSubHeader'

### Patch Changes

- Updated dependencies [2ea9555]
- Updated dependencies [50938e4]
- Updated dependencies [64ec032]
  - @elementor/editor-elements@0.7.0
  - @elementor/editor-controls@0.20.0
  - @elementor/editor-ui@0.5.0
  - @elementor/editor-styles-repository@0.8.1

## 1.22.0

### Minor Changes

- 202ff33: Set max global classes creation limit.

### Patch Changes

- 3e108d9: update elementor/ui
- 700303b: Prevent creation attempt to invalid css class.
- Updated dependencies [3e108d9]
- Updated dependencies [202ff33]
- Updated dependencies [593f222]
  - @elementor/editor-controls@0.19.1
  - @elementor/editor-panels@0.13.1
  - @elementor/editor-ui@0.4.3
  - @elementor/locations@0.7.7
  - @elementor/editor@0.18.4
  - @elementor/menus@0.1.4
  - @elementor/editor-styles-repository@0.8.0
  - @elementor/editor-elements@0.6.6

## 1.21.0

### Minor Changes

- 912cdb5: Add align-content control for flex with wrap

### Patch Changes

- 8523f8c: Updated tabs styles
- Updated dependencies [8523f8c]
- Updated dependencies [5387bcf]
- Updated dependencies [efd54a9]
- Updated dependencies [869906f]
  - @elementor/editor-controls@0.19.0
  - @elementor/editor-elements@0.6.5
  - @elementor/editor-props@0.11.1
  - @elementor/editor-styles-repository@0.7.8
  - @elementor/editor-styles@0.6.4

## 1.20.0

### Minor Changes

- 6cbaa91: Change v4 accordion style

### Patch Changes

- e67bdcb: Update control label spacing.
- Updated dependencies [85facff]
- Updated dependencies [e67bdcb]
  - @elementor/editor-controls@0.18.1

## 1.19.0

### Minor Changes

- 217d896: Add indicators to control labels to reflect the style inheritance.

### Patch Changes

- Updated dependencies [14610ee]
- Updated dependencies [217d896]
  - @elementor/editor-elements@0.6.4
  - @elementor/editor-controls@0.18.0
  - @elementor/editor-styles-repository@0.7.7

## 1.18.0

### Minor Changes

- c5d5e79: Add styles inheritance context for style tab
- 0ed25f2: Reorder font categories in font family control
- 6379dba: Allow renaming css class selector only on double click.
- d0d5d6e: fix the cut-off area caused by the overflow
- 5c469a4: Add no dynamic tags state view
- d8bc786: consistent dimension controls
- 4c2935b: Added support to atomic elements for command "document/elements/reset-style"
- f03fcf0: Add icon next to atomic widget heading
- 8231e7c: Added logic to block adding anchor/link to elements nested in or containing an already an anchored element
- 353031f: Refactored text decoration field with additional options and updated toggle control for non-exclusive selection.

### Patch Changes

- 7ff3371: update margin/padding location in the panel
- a789dfa: Change the class selector max tags limit.
- dcfcd9f: Move editor-current-user package to libs, added user capabilities usage in svg control
- c63e5db: Fix class menu: highlight selected state
- 6a5dd01: Fix text truncation at class autocomplete dropdown
- 19f5dfe: Children elements are not loaded from the right state
- 51432b9: The editor loader disappears before the styles finish rendering
- 03a6feb: class chip UX-UI enhancement
- Updated dependencies [1e2dfa0]
- Updated dependencies [1ead543]
- Updated dependencies [0ed25f2]
- Updated dependencies [dcfcd9f]
- Updated dependencies [e798985]
- Updated dependencies [91aa1eb]
- Updated dependencies [16453f0]
- Updated dependencies [d8bc786]
- Updated dependencies [6f36e05]
- Updated dependencies [4c2935b]
- Updated dependencies [7cf5003]
- Updated dependencies [3e9ffb0]
- Updated dependencies [8231e7c]
- Updated dependencies [19f5dfe]
- Updated dependencies [c002cba]
- Updated dependencies [353031f]
- Updated dependencies [51432b9]
- Updated dependencies [070b92c]
- Updated dependencies [1748439]
- Updated dependencies [0909b4b]
- Updated dependencies [c3a0125]
  - @elementor/editor-current-user@0.3.0
  - @elementor/editor-ui@0.4.2
  - @elementor/editor-controls@0.17.0
  - @elementor/editor-v1-adapters@0.11.0
  - @elementor/editor-props@0.11.0
  - @elementor/editor-elements@0.6.3
  - @elementor/editor@0.18.3
  - @elementor/editor-panels@0.13.0
  - @elementor/editor-styles-repository@0.7.6
  - @elementor/editor-responsive@0.13.3
  - @elementor/editor-styles@0.6.3

## 1.17.1

### Patch Changes

- Updated dependencies [7d37fc1]
- Updated dependencies [788208d]
  - @elementor/editor-controls@0.16.0
  - @elementor/editor-props@0.10.0
  - @elementor/editor-styles-repository@0.7.5
  - @elementor/editor-elements@0.6.2
  - @elementor/editor-styles@0.6.2

## 1.17.0

### Minor Changes

- a654cb2: Update `@elementor/icons` version
- 89a015d: Update dynamic tags empty state - no search results
- 810d72f: Added icon next to atomic widget heading
- f99d23c: Add missing tooltips for style controls

### Patch Changes

- 23458d1: Make atomic controls use Logical Properties
- cab4ddf: Improve Font Family control performance
- Updated dependencies [23458d1]
- Updated dependencies [a654cb2]
- Updated dependencies [cab4ddf]
- Updated dependencies [f99d23c]
- Updated dependencies [f6a4d4f]
- Updated dependencies [de85397]
- Updated dependencies [959e02c]
  - @elementor/editor-controls@0.15.0
  - @elementor/editor-props@0.9.4
  - @elementor/editor-ui@0.4.1
  - @elementor/editor-v1-adapters@0.10.2
  - @elementor/editor-panels@0.12.2
  - @elementor/editor-styles-repository@0.7.4
  - @elementor/editor-elements@0.6.1
  - @elementor/editor-styles@0.6.1
  - @elementor/editor@0.18.2
  - @elementor/editor-responsive@0.13.2

## 1.16.0

### Minor Changes

- 1a1e998: Add auto size unit to size controls
- bcf4254: VQA text fixes
- dcf1dfa: Added the styles inheritance model and an initial API

### Patch Changes

- Updated dependencies [1a1e998]
- Updated dependencies [bcf4254]
- Updated dependencies [c654f89]
- Updated dependencies [f4b76ac]
- Updated dependencies [ed5962d]
- Updated dependencies [571ff75]
  - @elementor/editor-controls@0.14.0
  - @elementor/editor-elements@0.6.0
  - @elementor/editor-styles@0.6.0
  - @elementor/editor-props@0.9.3
  - @elementor/utils@0.4.0
  - @elementor/editor-styles-repository@0.7.3
  - @elementor/editor-v1-adapters@0.10.1
  - @elementor/editor@0.18.1
  - @elementor/editor-panels@0.12.1
  - @elementor/editor-responsive@0.13.1

## 1.15.0

### Minor Changes

- 5f9500e: Update the advanced setting in the dynamic tags.

## 1.14.0

### Minor Changes

- 9a5fd67: Add support for inline flex

### Patch Changes

- Updated dependencies [33de95b]
  - @elementor/editor-controls@0.13.0

## 1.13.1

### Patch Changes

- Updated dependencies [164759c]
- Updated dependencies [994025a]
  - @elementor/editor-controls@0.12.1
  - @elementor/editor-panels@0.12.0

## 1.13.0

### Minor Changes

- 927578f: The creation of a popover grid container component.
- 10651bb: The creation of a popover content component.
- 1db202a: The creation of a styled panel stack component.
- a3f8440: Update auto icon inside the overflow control.

### Patch Changes

- Updated dependencies [927578f]
- Updated dependencies [e2d88d0]
- Updated dependencies [0acbc6a]
- Updated dependencies [10651bb]
- Updated dependencies [1db202a]
  - @elementor/editor-controls@0.12.0
  - @elementor/editor-panels@0.11.1

## 1.12.0

### Minor Changes

- f949dce: Add font style control
- 35092ea: Fixed strings to sentence case
- 9de89b0: The creation of a panel divider component.
- b001371: Prevent editable field validation for initial value.
- 2da724c: Fix input width changing, according to selection
- cf83fe4: Updated link control to save null instead of empty string, to allow it to pass validation, and re-add support of dynamic tags

### Patch Changes

- 1597a71: Add validation for class creation.
- Updated dependencies [728ffb5]
- Updated dependencies [35092ea]
- Updated dependencies [b001371]
- Updated dependencies [2da724c]
- Updated dependencies [cf83fe4]
  - @elementor/editor-props@0.9.2
  - @elementor/editor-controls@0.11.0
  - @elementor/editor-ui@0.4.0
  - @elementor/editor-styles-repository@0.7.2
  - @elementor/editor-elements@0.5.4
  - @elementor/editor-styles@0.5.7

## 1.11.1

### Patch Changes

- 6b064c5: Make atomic border radius control use logical properties
- Updated dependencies [dd8654a]
- Updated dependencies [6b064c5]
- Updated dependencies [158d092]
- Updated dependencies [87fa083]
  - @elementor/editor-ui@0.3.0
  - @elementor/editor-props@0.9.1
  - @elementor/editor-controls@0.10.0
  - @elementor/editor-styles-repository@0.7.1
  - @elementor/editor-elements@0.5.3
  - @elementor/editor-styles@0.5.6

## 1.11.0

### Minor Changes

- 910044c: update `@elementor/icons` and `@elementor/ui` packages.
- 9a41a86: Added condition to hide select control for tag bind when link is enabled
- 4ed562a: Support renaming label in classes manager.
- 95bde2a: Re-arranged CSS class selector code
- 6680c92: added svg widget
- 5caf78d: update `@elementor/ui` package.
- c162e6c: Update '@elementor/icons' version
- ad6fde0: Support history actions in style changes
- ddd8631: Changed text control layout to full
- ced00aa: Added display inline-block option to layout section

### Patch Changes

- e6c904a: Make global classes state changes synchronous
- efdadea: Create validation utils in style repository
- da38fa9: Remove unused exports and add missing dependencies.
- c2466b8: Update transform control to add 'none' option
- 14cbb1f: Fix Font Weight control
- 749da01: Text and sizes UI changes.
- fbd809b: Refactor provider-based actions in CSS class menu
- 9ca4eab: Deleted '@elementor/utils/session-storage' and replaced it with '@elementor/session'
- a738627: Added rename action to the global classes menu
- 21e888e: Update text align control to use logical properties
- b8e2a85: Add data hooks support
- Updated dependencies [9fd9bae]
- Updated dependencies [c9133d7]
- Updated dependencies [86863c1]
- Updated dependencies [e6c904a]
- Updated dependencies [188069d]
- Updated dependencies [e441663]
- Updated dependencies [efdadea]
- Updated dependencies [da38fa9]
- Updated dependencies [910044c]
- Updated dependencies [9a41a86]
- Updated dependencies [9de8ba7]
- Updated dependencies [35f9714]
- Updated dependencies [2bf6b34]
- Updated dependencies [4ed562a]
- Updated dependencies [0953b40]
- Updated dependencies [6680c92]
- Updated dependencies [9ca4eab]
- Updated dependencies [15c964f]
- Updated dependencies [5caf78d]
- Updated dependencies [625448d]
- Updated dependencies [c162e6c]
- Updated dependencies [b4a6ac6]
- Updated dependencies [ffad70a]
- Updated dependencies [ad6fde0]
- Updated dependencies [d39b70b]
- Updated dependencies [ebd9676]
- Updated dependencies [9cc8def]
- Updated dependencies [e76d970]
- Updated dependencies [d99471a]
- Updated dependencies [baee3f3]
- Updated dependencies [b8e2a85]
- Updated dependencies [fbf6203]
- Updated dependencies [ceb1211]
  - @elementor/editor-controls@0.9.0
  - @elementor/editor-props@0.9.0
  - @elementor/editor-styles-repository@0.7.0
  - @elementor/editor-elements@0.5.2
  - @elementor/editor-v1-adapters@0.10.0
  - @elementor/editor-responsive@0.13.0
  - @elementor/editor-panels@0.11.0
  - @elementor/editor-ui@0.2.0
  - @elementor/editor@0.18.0
  - @elementor/utils@0.3.1
  - @elementor/editor-styles@0.5.5

## 1.10.0

### Minor Changes

- c042725: Create `@elementor/editor-ui` package.
- 2b3f888: Show list of global classes in manager panel.
- 4fbe12c: Update `@elementor/icons` version.
- 19b0381: Change styles repository API

### Patch Changes

- 65d6ac7: Ignore base styles in the editing panel css selector
- 6c4d4a7: refactored CSS class menu and fix it's keyboard navigation
- b34f498: Fix global class styles not updating
- 68efdb1: Show long classes with ellipsis and tooltip.
- Updated dependencies [d61b1bc]
- Updated dependencies [c042725]
- Updated dependencies [6c4d4a7]
- Updated dependencies [a8b60c9]
- Updated dependencies [4fbe12c]
- Updated dependencies [b34f498]
- Updated dependencies [19b0381]
  - @elementor/editor-styles-repository@0.6.0
  - @elementor/editor-elements@0.5.1
  - @elementor/editor-ui@0.1.0
  - @elementor/editor-controls@0.8.0
  - @elementor/editor-panels@0.10.5
  - @elementor/editor@0.17.5
  - @elementor/editor-v1-adapters@0.9.1
  - @elementor/editor-styles@0.5.4
  - @elementor/editor-responsive@0.12.6

## 1.9.0

### Minor Changes

- e3c4a37: Update the order of background repeater image controls.
- 99fccc1: Updated icons in background repeater image overlay size control and elementor-icons version
- 005d737: Register new css class manager panel.
- 7b499aa: Add Background Position control.

### Patch Changes

- cfbd198: Update `@elementor/ui` version
- a13a209: Refactor editor-elements to not use the commands
- c9de3e2: Prevent `EditableField` blur on click in edit mode.
- Updated dependencies [b8b2053]
- Updated dependencies [d90521a]
- Updated dependencies [a2f5096]
- Updated dependencies [51a5ab9]
- Updated dependencies [27f5860]
- Updated dependencies [e3c4a37]
- Updated dependencies [aa5ab2b]
- Updated dependencies [f691712]
- Updated dependencies [cfbd198]
- Updated dependencies [f1a2ffb]
- Updated dependencies [a13a209]
- Updated dependencies [4d1fd00]
- Updated dependencies [1bec508]
- Updated dependencies [99fccc1]
- Updated dependencies [5829b05]
- Updated dependencies [554a6ce]
- Updated dependencies [f25fc07]
- Updated dependencies [92a8c22]
- Updated dependencies [7b499aa]
  - @elementor/editor-styles-repository@0.5.0
  - @elementor/editor-elements@0.5.0
  - @elementor/editor-controls@0.7.0
  - @elementor/editor-panels@0.10.4
  - @elementor/editor@0.17.4
  - @elementor/editor-props@0.8.0
  - @elementor/editor-styles@0.5.3
  - @elementor/menus@0.1.3

## 1.8.1

### Patch Changes

- 7582ba6: Modify linked dimensions control functionality
- Updated dependencies [bd1b038]
- Updated dependencies [4e5ea74]
- Updated dependencies [65d3c4c]
- Updated dependencies [7582ba6]
- Updated dependencies [7654921]
  - @elementor/editor-controls@0.6.1
  - @elementor/editor-v1-adapters@0.9.0
  - @elementor/editor-props@0.7.1
  - @elementor/editor@0.17.3
  - @elementor/editor-panels@0.10.3
  - @elementor/editor-styles-repository@0.4.1
  - @elementor/editor-elements@0.4.2
  - @elementor/editor-responsive@0.12.5
  - @elementor/editor-styles@0.5.2

## 1.8.0

### Minor Changes

- b40b621: Added unapply action to the global classes menu
- 534bfbf: Add editable field to CSS class selector.
- dab01fd: Created an autocomplete control and extended link control.
- 43f1684: Save previous link value in session
- 499c531: Add binds path to prop context.

### Patch Changes

- b85bc00: Remove shorthand from border-style initial values.
- Updated dependencies [45038fc]
- Updated dependencies [e742340]
- Updated dependencies [534bfbf]
- Updated dependencies [dab01fd]
- Updated dependencies [43f1684]
- Updated dependencies [499c531]
  - @elementor/editor-controls@0.6.0
  - @elementor/editor-props@0.7.0
  - @elementor/editor-styles-repository@0.4.0
  - @elementor/session@0.1.0
  - @elementor/editor-elements@0.4.1
  - @elementor/editor-styles@0.5.1

## 1.7.0

### Minor Changes

- fbde10d: Add UX flow for creating new global class
- a2245c5: Change prop provider infra to support nested props.
- d4ff040: added "sticky" options for position control on styles tab

### Patch Changes

- 1f2cf85: Update classes prop type
- Updated dependencies [5fc8d7b]
- Updated dependencies [fbde10d]
- Updated dependencies [a2245c5]
  - @elementor/editor-controls@0.5.0
  - @elementor/editor-styles-repository@0.3.3
  - @elementor/editor-elements@0.4.0
  - @elementor/editor-styles@0.5.0
  - @elementor/editor-props@0.6.0

## 1.6.0

### Minor Changes

- b18d1a6: Added pseudo selectors to css class selectors

### Patch Changes

- Updated dependencies [6a3622a]
- Updated dependencies [b18d1a6]
  - @elementor/editor-controls@0.4.1
  - @elementor/editor-props@0.5.1
  - @elementor/editor-styles@0.4.0
  - @elementor/editor-elements@0.3.5
  - @elementor/editor-styles-repository@0.3.2

## 1.5.1

### Patch Changes

- Updated dependencies [1762144]
  - @elementor/editor-elements@0.3.4
  - @elementor/editor-styles-repository@0.3.1

## 1.5.0

### Minor Changes

- 87c241b: Remove shorthand support for dynamic settings.
- b8e2a87: Background infra changes
- c2f112e: Show flex controls to children elements of flex parent

### Patch Changes

- ca63a26: Changed conditional tooltip inner prop name to fix MUI errors.
- 4125800: Order classes by priority in the css class selector
- Updated dependencies [3019657]
- Updated dependencies [2653cf0]
- Updated dependencies [862178c]
- Updated dependencies [ed4260a]
  - @elementor/editor-controls@0.4.0
  - @elementor/editor-styles-repository@0.3.0

## 1.4.1

### Patch Changes

- a0ca1d8: fixed an issue where persisting dimensions values behaved unpredictably when switching breakpoints
- Updated dependencies [a0ca1d8]
  - @elementor/editor-controls@0.3.1

## 1.4.0

### Minor Changes

- 6f2b17f: Introduce empty (local) style def for class selector.
- ff35b95: Added Gaps field with a control, proptype and a transformer
- 7176c7b: set global classes chips max width

### Patch Changes

- Updated dependencies [6f2b17f]
- Updated dependencies [8943189]
- Updated dependencies [ff35b95]
  - @elementor/editor-styles-repository@0.2.0
  - @elementor/editor-elements@0.3.3
  - @elementor/editor-props@0.5.0
  - @elementor/editor-controls@0.3.0
  - @elementor/editor-styles@0.3.2

## 1.3.0

### Minor Changes

- 0edc1f2: Added Flex child align self
- c393288: Remove support for shorthand prop values.
- bc728b7: Add type and validation support to `useBoundProp`
- 72a6a18: Added flex size field
- b05b412: added line height control and rearranged the typography section
- 14e1fcf: Added link control field

### Patch Changes

- 2c230a4: Fixed icon rotation mechanism and align-items value from justify to stretch
- ae537f7: Update tooltip texts
- 91453b3: Update and lock dependencies versions
- Updated dependencies [c393288]
- Updated dependencies [bc728b7]
- Updated dependencies [91453b3]
  - @elementor/editor-controls@0.2.0
  - @elementor/editor-props@0.4.0
  - @elementor/editor-v1-adapters@0.8.5
  - @elementor/editor-responsive@0.12.4
  - @elementor/editor-elements@0.3.2
  - @elementor/editor-panels@0.10.2
  - @elementor/editor-styles@0.3.1
  - @elementor/editor@0.17.2
  - @elementor/menus@0.1.2

## 1.2.0

### Minor Changes

- 40e6e5f: Added flex direction field
- 1d557f6: Added flex order field
- c2fdb15: Added flex align items field
- 463c695: Added flex wrap field

### Patch Changes

- dee4071: Introduce apply/unapply for Class Selector
- 70e5d28: Text Stroke Control removal functionality
- 1926fe1: Update dependencies
- Updated dependencies [081bae8]
- Updated dependencies [1926fe1]
- Updated dependencies [f584292]
  - @elementor/editor-responsive@0.12.3
  - @elementor/editor-elements@0.3.1
  - @elementor/editor-controls@0.1.1
  - @elementor/editor-panels@0.10.1
  - @elementor/editor@0.17.1
  - @elementor/editor-styles@0.3.0

## 1.1.0

### Minor Changes

- e7f4706: save style props to session
- e4c6e3b: update @elementor/ui version
  fix color picker position in box shadow repeater control
  make the color control full width
- 53ac7c9: Add support for a single size shorthand in EqualUnequalSizesControl
- 00bdd7e: Added layout section with display field, updated toggle button group to match new children elements
- 1d6619b: Close edit panel for atomic widget upon deletion
- cecdfba: Updated display field with a flex option, together with a "justify content" field
- 1d7879e: Add `MultiCombobox` with actions.
- 19bf117: Add font family control to style tab
- 55962f8: Add background color overlay control
- e2ee013: Created the `editor-controls` packages.

### Patch Changes

- 7781969: Create basic UI for the class selector
- 95bb0ce: Update Section to use Collapse component instead of Accordion
- 8fe671b: Fix typos in texts and file names
- 7781969: Update `@elementor/ui` version
- 5c3d546: Fix some style issues in the editing panel and controls
- Updated dependencies [e7f4706]
- Updated dependencies [7781969]
- Updated dependencies [e4c6e3b]
- Updated dependencies [d21c5c3]
- Updated dependencies [00bdd7e]
- Updated dependencies [6e240a8]
- Updated dependencies [cecdfba]
- Updated dependencies [6d5475d]
- Updated dependencies [7781969]
- Updated dependencies [0c6bcb6]
- Updated dependencies [5c3d546]
- Updated dependencies [55962f8]
- Updated dependencies [e2ee013]
  - @elementor/editor-elements@0.3.0
  - @elementor/utils@0.3.0
  - @elementor/editor-styles@0.2.1
  - @elementor/editor-controls@0.1.0
  - @elementor/editor-panels@0.10.0
  - @elementor/editor@0.17.0
  - @elementor/editor-props@0.3.0
  - @elementor/editor-v1-adapters@0.8.4

## 1.0.0

### Major Changes

- eecd225: Create separated elements, controls, props folders.

### Minor Changes

- bfaad79: Hide empty floating actions bars
- f4a8651: Added additional border params - style, color and width
- e489102: Fix forwardRef error in `TextFieldInnerSelection`
- 6b9f40a: Added position fixed
- 04e58ea: Added overflow control to size section
- 22f8240: Replaced `UnstableColorPicker` with `UnstableColorField` in color control
- e035b94: Added border-radius style control
- 3b46d09: Added `box-shadow` transformer.
- a46ac3a: Created the `editor-elements` packages.
- 27334a3: Add a new Position section
- 0218ca1: Changed style tab sections order and collapse all sections by default
- 0820794: Split control-actions as preparation to a new controls package.
- e1a0004: Added position absolute
- eac188a: Update background-color control to use the new color picker component.
- e69bdae: Created the `editor-props` and `editor-styles` packages.
- c020e19: Add Text Stroke Control
- bf12c4d: Moved all prop type utils to the `editor-props` package.

### Patch Changes

- 9abdfaf: Fix package.json exports field
- 2b28089: Add classes prop context to support global classes
- 036b439: Refactor styles context as preparation for global css classes
- 6cf7ba1: Change controls naming
- Updated dependencies [9abdfaf]
- Updated dependencies [2b28089]
- Updated dependencies [036b439]
- Updated dependencies [22f8240]
- Updated dependencies [a46ac3a]
- Updated dependencies [6cf7ba1]
- Updated dependencies [e69bdae]
- Updated dependencies [bf12c4d]
  - @elementor/editor-v1-adapters@0.8.3
  - @elementor/editor-responsive@0.12.2
  - @elementor/editor-panels@0.9.0
  - @elementor/wp-media@0.2.1
  - @elementor/editor@0.16.0
  - @elementor/menus@0.1.1
  - @elementor/utils@0.2.2
  - @elementor/editor-styles@0.2.0
  - @elementor/editor-elements@0.2.0
  - @elementor/editor-props@0.2.0

## 0.19.0

### Minor Changes

- e5a2a79: Add error handling
- 08bc1c0: Moved the element provider and types into controls
- d68e4df: Add background section with background-color control

### Patch Changes

- a4b1789: Add `CreateControlReplacement` util
- b9d3b21: Fix typography section controls alignment

## 0.18.0

### Minor Changes

- c1f4bcb: Added `TextDirectionControl`
- 1206fbd: Added support for inner props in `ImageControl`
- 8bbc145: Update `@elementor/icons` version
- b7dca9f: Update `@elementor/icons` version
- aa24b6f: Render settings control layout by type
- 701fc35: Updated color picker version
- 4d27f27: Added controls repeater, and box shadow control.
- 9a77872: adding control floating bar
- 28620a5: added registration of dynamic tag item to control actions
- d1b6297: Use Grid components to render style controls layout.

### Patch Changes

- 97e6534: Changed bind name format and added color prop type
- 68e3a30: apply control replacement on the control component

  create a function to wrap each control to allow general solutions for each control

- 20e9aeb: Adjusting `prop-types` to fit the new structure
- 8a50411: change linked dimensions control default value
- Updated dependencies [1206fbd]
- Updated dependencies [97e6534]
- Updated dependencies [701fc35]
  - @elementor/wp-media@0.2.0
  - @elementor/editor-style@0.4.1
  - @elementor/editor-panels@0.8.0
  - @elementor/editor@0.15.0

## 0.17.0

### Minor Changes

- e4f30e9: Restore previous value from session when removing the dynamic value.
- 658f569: added `TextAlignmentControl`

### Patch Changes

- Updated dependencies [59c991b]
  - @elementor/editor-style@0.4.0

## 0.16.0

### Minor Changes

- ad6aec4: Update `SizeControl` component
- cf81790: Update `@elementor/icons` version
- f702a03: Toggle linked control icon
- 4f78dec: adding letter-spacing style control
- ccde574: Create dynamic selection control with settings popover
- 0f30451: Adding spacing icons to `editor-editing-panel`
- 33e110d: Added `ControlToggleButtonGroup`
- 285b2ed: add text color control
- 1b67bf8: Added `SpacingSection` and `LinkedDimensionsControl` components
- 0e70721: Update `@elementor/ui` and `@elementor/icons` versions
- 4b9f9f2: add z-index control
- 14ae76d: Adding transform style control
- 709fb22: Added `DynamicSelection` component
- 4128717: adding word-spacing style control
- 1b97b07: Change `StyleTab` layout
- 830a19a: Add dynamic wrapper, separate dynamics from controls

### Patch Changes

- a2a9237: Remove hard-coded classes prop type
- Updated dependencies [49b8465]
- Updated dependencies [0e70721]
  - @elementor/editor-style@0.3.0
  - @elementor/editor-panels@0.7.0
  - @elementor/editor@0.14.0

## 0.15.0

### Minor Changes

- c67ae92: Add control component
- c9c430d: Create hook for supported dynamic categories
- 68acbed: Add font size control, separate customs from generic controls
- 4929220: Refactor - move `elementType` into `ElementContext`
- c3a53d7: Add icons to `TextStyleControl`
- 730ef85: Add `getDynamicTagsByCategories` function
- ed21ec8: Create a font weight control in the editor panel
- 4c6e274: Add support for default values from the widget schema

### Patch Changes

- 44d49dd: Update `@elementor/ui` version
- ad3cd19: Fix settings control layout when there is no label

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.14.2](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.14.1...@elementor/editor-editing-panel@0.14.2) (2024-08-25)

**Note:** Version bump only for package @elementor/editor-editing-panel

## [0.14.1](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.14.0...@elementor/editor-editing-panel@0.14.1) (2024-08-25)

**Note:** Version bump only for package @elementor/editor-editing-panel

# [0.14.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.13.0...@elementor/editor-editing-panel@0.14.0) (2024-08-22)

### Features

- **editor-editing-panel:** add collapsible section [EDS-345] ([#248](https://github.com/elementor/elementor-packages/issues/248)) ([8e362a6](https://github.com/elementor/elementor-packages/commit/8e362a6176d03f6ba89dda0aef5d4f888c7afe44))

# [0.13.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.12.0...@elementor/editor-editing-panel@0.13.0) (2024-08-21)

### Features

- **editor-editing-panel:** add text style control [EDS-329] ([#242](https://github.com/elementor/elementor-packages/issues/242)) ([2cc149b](https://github.com/elementor/elementor-packages/commit/2cc149b7471c31ff9e577f85a1a0269f10ec0169))

# [0.12.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.11.2...@elementor/editor-editing-panel@0.12.0) (2024-08-20)

### Features

- **editor-editing-panel:** change attachment control to image control [EDS-370] ([#244](https://github.com/elementor/elementor-packages/issues/244)) ([35d8e1f](https://github.com/elementor/elementor-packages/commit/35d8e1f9592d2d376b21ab1fc53e17865d124066))

## [0.11.2](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.11.1...@elementor/editor-editing-panel@0.11.2) (2024-08-20)

**Note:** Version bump only for package @elementor/editor-editing-panel

## [0.11.1](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.11.0...@elementor/editor-editing-panel@0.11.1) (2024-08-19)

**Note:** Version bump only for package @elementor/editor-editing-panel

# [0.11.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.10.0...@elementor/editor-editing-panel@0.11.0) (2024-08-15)

### Features

- **editor-editing-panel:** add control internal state hook [EDS-359] ([#232](https://github.com/elementor/elementor-packages/issues/232)) ([c9cbced](https://github.com/elementor/elementor-packages/commit/c9cbced3d8136f8bb157a0ab3878076b08e521f5))

# [0.10.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.9.1...@elementor/editor-editing-panel@0.10.0) (2024-08-14)

### Features

- **editor-editing-panel:** init attachment control [EDS-320] ([#239](https://github.com/elementor/elementor-packages/issues/239)) ([9871e10](https://github.com/elementor/elementor-packages/commit/9871e105c98b8c4502289cf8cf99d75b4074e0a9))

## [0.9.1](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.9.0...@elementor/editor-editing-panel@0.9.1) (2024-08-06)

**Note:** Version bump only for package @elementor/editor-editing-panel

# [0.9.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.8.0...@elementor/editor-editing-panel@0.9.0) (2024-08-06)

### Features

- **editor-style:** style renderer package for atomic widgets [EDS-278] ([#213](https://github.com/elementor/elementor-packages/issues/213)) ([f80501b](https://github.com/elementor/elementor-packages/commit/f80501b17567fe3bb427655ee77013a61168f88f))

# [0.8.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.7.0...@elementor/editor-editing-panel@0.8.0) (2024-08-06)

### Features

- **editor-editing-panel:** render size controls [EDS-318] ([#229](https://github.com/elementor/elementor-packages/issues/229)) ([a1564ae](https://github.com/elementor/elementor-packages/commit/a1564ae1a0c04a64dd4a2daa49c3f0c77c0d5d18))

# [0.7.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.6.1...@elementor/editor-editing-panel@0.7.0) (2024-08-05)

### Features

- **editor-editing-panel:** init size control [EDS-316] ([#224](https://github.com/elementor/elementor-packages/issues/224)) ([b0a0159](https://github.com/elementor/elementor-packages/commit/b0a015951b953b982d619ed34a2e51bd22f11976))

## [0.6.1](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.6.0...@elementor/editor-editing-panel@0.6.1) (2024-08-05)

### Bug Fixes

- **editor-editing-panel:** change update style props ([#228](https://github.com/elementor/elementor-packages/issues/228)) ([3918096](https://github.com/elementor/elementor-packages/commit/3918096741825f034c710519bc0e29d9f22001fe))

# [0.6.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.5.1...@elementor/editor-editing-panel@0.6.0) (2024-08-05)

### Bug Fixes

- publish only necessary files to npm ([#226](https://github.com/elementor/elementor-packages/issues/226)) ([d808e2f](https://github.com/elementor/elementor-packages/commit/d808e2f60eb7ca2d7b8560d0b79c0e62c2f969a8))

### Features

- **editor-editing-panel:** add input control input [EDS-308] ([#222](https://github.com/elementor/elementor-packages/issues/222)) ([0370fce](https://github.com/elementor/elementor-packages/commit/0370fcebb07f9768094e123365e2fb3d89f852fc))
- **editor-editing-panel:** add style control wrapper [EDS-319] ([#227](https://github.com/elementor/elementor-packages/issues/227)) ([1494a60](https://github.com/elementor/elementor-packages/commit/1494a60767fe82a9cf2a1cc8e5b487975e12a0c4))
- **editor-editing-panel:** add styles API [ EDS-281 ] ([#223](https://github.com/elementor/elementor-packages/issues/223)) ([f3fdc2a](https://github.com/elementor/elementor-packages/commit/f3fdc2aa06ec21fcad707ced707a880dd2a0f045))
- **editor-editing-panel:** change textarea component [EDS-311] ([#221](https://github.com/elementor/elementor-packages/issues/221)) ([a9ab0d5](https://github.com/elementor/elementor-packages/commit/a9ab0d53e87086e323c4f024dca0eae93005e1a1))
- **editor-editing-panel:** settings and style tabs [EDS-277] ([#217](https://github.com/elementor/elementor-packages/issues/217)) ([c623797](https://github.com/elementor/elementor-packages/commit/c6237974d9940a2b58bdd1df3d835dc828e323f4))

## [0.5.1](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.5.0...@elementor/editor-editing-panel@0.5.1) (2024-07-18)

### Bug Fixes

- **editor-editing-panel:** add missing deps to useWidgetSettings [EDS-273] ([#205](https://github.com/elementor/elementor-packages/issues/205)) ([d6dc5df](https://github.com/elementor/elementor-packages/commit/d6dc5dfcd7f0eb7354570051292e4bf4079a28cc))

# [0.5.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.4.2...@elementor/editor-editing-panel@0.5.0) (2024-07-17)

### Features

- **editor-editing-panel:** connect controls to element context [EDS-253] ([#203](https://github.com/elementor/elementor-packages/issues/203)) ([12bd853](https://github.com/elementor/elementor-packages/commit/12bd8530713b92aa56716ad3b496f326d7e1b2b9))

## [0.4.2](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.4.1...@elementor/editor-editing-panel@0.4.2) (2024-07-16)

**Note:** Version bump only for package @elementor/editor-editing-panel

## [0.4.1](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.4.0...@elementor/editor-editing-panel@0.4.1) (2024-07-16)

**Note:** Version bump only for package @elementor/editor-editing-panel

# [0.4.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.3.0...@elementor/editor-editing-panel@0.4.0) (2024-07-16)

### Features

- **editor-editing-panel:** settings control infra for atomic controls [EDS-236] ([#201](https://github.com/elementor/elementor-packages/issues/201)) ([25214f3](https://github.com/elementor/elementor-packages/commit/25214f35970572be059fa3ea98c0905f4535f9f9))

# [0.3.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.2.0...@elementor/editor-editing-panel@0.3.0) (2024-07-14)

### Features

- **editor-editing-panel:** element context [EDS-255] ([#200](https://github.com/elementor/elementor-packages/issues/200)) ([cff677e](https://github.com/elementor/elementor-packages/commit/cff677eec3690fe8b9569d5fd27c2512a981334c))

# [0.2.0](https://github.com/elementor/elementor-packages/compare/@elementor/editor-editing-panel@0.1.0...@elementor/editor-editing-panel@0.2.0) (2024-07-11)

### Features

- **editor-editing-panel:** api for selecting and widget type [EDS-244] ([#199](https://github.com/elementor/elementor-packages/issues/199)) ([3e3da8a](https://github.com/elementor/elementor-packages/commit/3e3da8ac1dc37e502991f0905cbe8054422b3b71))

# 0.1.0 (2024-07-08)

### Features

- **editor-editing-panel:** create editor panel package [EDS-226] ([#188](https://github.com/elementor/elementor-packages/issues/188)) ([e361aed](https://github.com/elementor/elementor-packages/commit/e361aed023c3a5d4dd329b354f1403de238da20e))
