## API - `$e.uiStates`
*  **Description**: `$e.uiStates` API is a UI state manager that allows you to create custom UI states for your components.
*  **Location**: *core/common/assets/js/api/core/ui-states.js*
*  **Methods**:

| Method                     | Params                                                   | Returns   | Description
|----------------------------|----------------------------------------------------------|-----------|---------------------------------------------------------------------
| `$e.uiStates.register()`   |`{UiStateBase}` *instance*   								| `{void}`  | Register a new UI state.
| `$e.uiStates.getAll()`     |                                                          | `{Object}`| Get all existing UI states with their options.
| `$e.uiStates.get()`        | `{String}` *state*                                       | `{Object}`| Get the state value, or return all of them if no `state` is set.
| `$e.uiStates.set()`        | `{String}` *state*, `{String}` *value*                   | `{void}`  | Set the current state value and trigger its callbacks & events.
| `$e.uiStates.remove()`     | `{String}` *state*                                       | `{void}`  | Remove a state.
| `$e.uiStates.getCurrent()` | `{String}` *state*                                       | `{string}`| Get the current state value.
* **Notes**:
	- Each UI state has its own options & callback for each option.
	- When a UI state is being changed, it:
		- Adds a CSS class to the context elements (`e-ui-state--${ stateID }__${ value }`) - Slashes are being replaced by hyphens (e.g. `document/direction-mode` will become `document-direction-mode`).
		- Dispatches a custom event to the scope elements (`state:${ stateID }`) with `oldValue` and `newValue` under `e.detail`.
	- Setting an invalid option to a state will throw an error.

## Guidelines, Conventions & Files Structure:
* Each UI state is owned by a [component](./components.md#guidelines-conventions--files-structure).
* Each [component](./components.md#guidelines-conventions--files-structure) can override the `defaultUiStates()` method to return a set of UI states of its own.
* The UI state are imported via built-in method called `importUiStates()`.
	* All the UI states should be exported in one index file:
	    ```javascript
		// ui-states/index.js
		export { DirectionMode } from './direction-mode';
		export { ColorPickingMode } from './color-picking-mode';
		```
	  You can have as many indexes as you wish in every hierarchy under `component/ui-states/some/long/path` in order to organize your code, but the requirement is to have a single index file
	  at `component/ui-states/index.js` which exports all the UI states. Take the **index.js** example above as a scenario:
	    ```html
		📦 component
		│   📜 component.js
		│
		└───📂 ui-states
		       📜 color-picking-mode.js
		       📜 direction-mode.js
		       📜 index.js ( has all the UI states exported )
		```
	* The UI states are being imported using `importUiStates()`, for example:
	    ```javascript
		import * as uiStates from './ui-states';

		export class Component extends $e.modules.ComponentBase {
			getNamespace() {
				return 'component-name';
			}

			defaultUiStates() {
				return this.importUiStates( uiStates );
			}
		}
		```
* UI State conventions:
  ```javascript
  import UiStateBase from 'elementor-api/core/states/ui-state-base';

  export class {FILE_NAME_CAMEL_CASE} extends UiStateBase {
	  getId() {
		  return {FILE_NAME_WITHOUT_EXTENSION}; // Will be automatically prefixed with the component namespace by default.
	  }

	  getPrefix() {
		  return {CUSTOM_PREFIX_KEBAB_CASE}; // Override the default prefix.
	  }
  
	  getOptions() {
		  // Object of options that the state can be set to.
		  return {
			  {OPTION_VALUE_KEBAB_CASE}: ( oldValue, newValue ) => {
				  /* Callback that runs when the state is set to this option. */
			  },
			  {OPTION_VALUE_KEBAB_CASE}: ( oldValue, newValue ) => {
				  /* Callback that runs when the state is set to this option. */
			  },
		  };
	  }
  }

  ```

  > Legend

  | Name                          | Format - Description                                      | Example value
    |-------------------------------|-----------------------------------------------------------|---------------------
  |`{FILE_NAME_CAMEL_CASE}`       | CamelCase representation of the current file name.        | `DirectionMode`
  |`{FILE_NAME_WITHOUT_EXTENSION}`| Current file name without the `.js` extension.            | `direction-mode`
  |`{CUSTOM_PREFIX_KEBAB_CASE}`   | A kebab-case string.                                      | `some-custom-prefix`
  |`{OPTION_VALUE_KEBAB_CASE}`    | A kebab-case string.                                      | `option-1`

  > Example - A UI state for editing mode direction:
  ```javascript
  import UiStateBase from 'elementor-api/core/states/ui-state-base';

  export const DIRECTION_ROW = 'row';
  export const DIRECTION_COLUMN = 'column';

  export class DirectionMode extends UiStateBase {
	  getId() {
		  return 'direction-mode';
	  }

	  getOptions() {
		  return {
			  [ DIRECTION_ROW ]: '',
			  [ DIRECTION_COLUMN ]: '',
		  };
	  }
  }
  ```

### [Back](../readme.md) 
