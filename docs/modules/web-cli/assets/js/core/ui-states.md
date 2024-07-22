## API - `$e.uiStates`
*  **Description**: `$e.uiStates` API is a UI state manager that allows to create custom UI states for components.
   It reflects the component's state in the UI itself and allows the whole editor to react accordingly
   (i.e. rotate icons, hide buttons, etc.).  
*  **Location**: *core/common/assets/js/api/core/ui-states.js*
*  **Methods**:

| Method                     | Params                                                   | Returns   | Description
|----------------------------|----------------------------------------------------------|-----------|---------------------------------------------------------------------
| `$e.uiStates.register()`   |`{UiStateBase}` *instance*   								| `{void}`  | Register a new UI state.
| `$e.uiStates.getAll()`     |                                                          | `{Object}`| Get all existing UI states with their options.
| `$e.uiStates.get()`        | `{String}` *state* (optional)							| `{Object}`| Get the state value, or return all of them if no `state` is set.
| `$e.uiStates.set()`        | `{String}` *state*, `{String}` *value*                   | `{void}`  | Set the current state value and trigger its callbacks & events.
| `$e.uiStates.remove()`     | `{String}` *state*                                       | `{void}`  | Remove a state.
| `$e.uiStates.getCurrent()` | `{String}` *state*                                       | `{string}`| Get the current state value.
* **Notes**:
	- Each UI state has options and an optional callback for each option (a callback that will execute each time the state has changed to this value).
	- When a UI state is being changed, it:
		- Adds a CSS class to the scope elements (`e-ui-state--${ stateID }__${ value }`) - Slashes are being replaced by hyphens (e.g. `document/direction-mode` will become `document-direction-mode`).
		- Dispatches a custom event to the scope elements (`e-ui-state:${ stateID }`, e.g. `e-ui-state:document/direction-mode`) with `oldValue` and `newValue` under `e.detail`.
	- Setting an invalid option to a state will throw an error.

## Guidelines, Conventions & Files Structure:
* Each UI state is owned by a [component](./components.md#guidelines-conventions--files-structure).
* Each [component](./components.md#guidelines-conventions--files-structure) can override the `defaultUiStates()` method to return a set of UI states of its own.
* The UI states are imported via a built-in method called `importUiStates()`.
	* All the UI states should be exported in one index file:
	    ```javascript
		// ui-states/index.js
		export { DirectionMode } from './direction-mode';
		export { ColorPickingMode } from './color-picking-mode';
		```
	  A component can have as many indexes as needed in every hierarchy under `component/ui-states/some/long/path` in order to organize its code, but the requirement is to have a single index file
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
			// A unique ID for the current namespace ( unlsess it's overridden using `getPrefix()` ).
			// Will be automatically prefixed with the component namespace by default.
			return {FILE_NAME_WITHOUT_EXTENSION};
		}
	
		getPrefix() {
			// Override the default prefix.
			return {CUSTOM_PREFIX_KEBAB_CASE};
		}
	
		getScopes() {
			// List of `HTMLElement`s that the state will dispatch events && add CSS classes to.
			// ( Defaults to `document.body` )
			return [
				window.document.body,
			];
		}
	
		getOptions() {
			// Object of options that the state can be set to, with an optional callback for each option.
			return {
				{OPTION_VALUE_KEBAB_CASE}: '',
				'on': ( oldValue, newValue ) => {
					// Callback that runs when the state is set to `on`.
				},
				'off': this.onStateOff,
			};
		}
 
		onChange( oldValue, newValue ) {
			// Callback that runs on state change.
			console.log( { oldValue, newValue } );
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

  > Example - A UI state for editing direction-mode:
  
	Let's assume there is the following UI state: 
  
	```javascript
	import UiStateBase from 'elementor-api/core/states/ui-state-base';
	
	// A good practice is to export the state options as constants so they 
	// can be used when setting the state from another place.
	export const DIRECTION_ROW = 'row';
	export const DIRECTION_COLUMN = 'column';
	
	export class DirectionMode extends UiStateBase {
		getId() {
			return 'direction-mode';
		}
		
		getPrefix() {
			return 'document';
		}
		
		getScopes() {
			return [
				window.document.body,
				elementor.$previewContents[ 0 ],
			];
		}
		
		getOptions() {
			return {
				[ DIRECTION_ROW ]: '',
				[ DIRECTION_COLUMN ]: '',
			};
		}
		
		onChange( oldValue, newValue ) {
			console.log( 'Direction mode changed', { oldValue, newValue } );
		}
	}
	```
 
	Later on, on any state change, `onChange()` will be fired and will log the values to the console.
  
	In addition, a CSS class (`e-ui-state--document-direction-mode__column` [ or `__row`, depends on the state value ]) will be added to both of the scopes that were provided (editor & preview in this case).

	Plus, a custom event (`e-ui-state:document/direction-mode`) will be fired to the scopes, and those scopes can listen to that
  	event using a simple `addEventListener()`:

	```javascript
	import { DIRECTION_ROW } from 'elementor-document/ui-states/direction-mode';
 
	// Change the `direction-mode` state:
	$e.uiStates.set( 'document/direction-mode', DIRECTION_ROW );
 
 
	// Listen to changes:
	window.document.body.addEventListener( 'e-ui-state:document/direction-mode', ( e ) => {
		const { oldValue, newValue } = e.detail;
		
		console.log( 'Direction mode changed', { oldValue, newValue } );
	} );

	// OR

	elementor.$previewContents[ 0 ].addEventListener( 'e-ui-state:document/direction-mode', ( e ) => {
		const { oldValue, newValue } = e.detail;
		
		console.log( 'Direction mode changed', { oldValue, newValue } );
	} );
	```

### [Back](../readme.md) 
