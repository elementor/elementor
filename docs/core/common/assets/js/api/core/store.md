## API - `$e.store`
*  **Description**: `$e.store` API is a global state manager that allows to create global states for components.
   It's actually a wrapper around [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started), and it uses [Slices](https://redux-toolkit.js.org/api/createslice) under the hood.
*  **Location**: *core/common/assets/js/api/core/store.js*
*  **Methods**:

| Method                        | Params                                                    | Returns                 | Description
|-------------------------------|-----------------------------------------------------------|-------------------------|---------------------------------------------------------------------
| `$e.store.register()`         | `{String}` *sliceId*, `{Slice}` *instance*   			    | `{void}`                | Register a new [Redux Toolkit Slice](https://redux-toolkit.js.org/api/createslice).
| `$e.store.getAll()`           |                                                           | `{Object}`              | Get all existing Slices.
| `$e.store.get()`              | `{String}` *sliceId* (optional)						    | `{Slice}` \| `{Object}` | Get a specific Slice instance by its ID, or get all of them if ID is empty.
| `$e.store.getReduxStore()`    |                                                           | `{Object}`              | Get the actual [Redux Store](https://redux-toolkit.js.org/api/configureStore) object (mainly used for setting up a `<Provider />` in React).
| `$e.store.getState()`         |                                                           | `{any}`                 | Get the [current global state tree](https://redux.js.org/api/store#getstate).
| `$e.store.subscribe()`        | `{Function}` *listener*                                   | `{function}`            | [Subscribe](https://redux.js.org/api/store#subscribelistener) to state changes.
| `$e.store.dispatch()`         | `{Object}` *action*                                       | `{Object}`              | [Dispatch](https://redux.js.org/api/store#dispatchaction) a Redux action.


## Guidelines & Conventions:
* Each Slice is owned by a [component](./components.md#guidelines-conventions--files-structure).
* Each [component](./components.md#guidelines-conventions--files-structure) can override the `defaultStates()` method to return a set of [Slices configurations](https://redux-toolkit.js.org/api/createslice) (e.g. `initialState` & `reducers`).
* The slices are identified by their key in the Slices definition object, and are prefixed with the component namespace to avoid conflicts (see example below).


## Example:
Defining and consuming a global state inside a component is fairly easy after you understand the basic concepts.
Here is an example of a component with basic Slices configuration:

```javascript
// Component code....

getNamespace() {
	return 'example';
}

defaultStates() {
	return {
		// A correspnding `Slice` instance will be available under `$e.store.get( 'example' )`.
		'': {
			initialState: {
				count: 0,
			},
			reducers: {
				setCount: ( state, { payload } ) => {
					return {
						count: payload,
					};
				},
			},
		},
		// A correspnding `Slice` instance will be available under `$e.store.get( 'example/test' )`.
		'test': {
			initialState: {
				name: 'StyleShit',
			},
			reducers: {
				setName: ( state, { payload } ) => {
					return {
						name: payload,
					};
				},
			},
		},
	};
}

// More component code....
```

Later on, you can use the `dispatch()` method with the appropriate *Action* in order to call a *Reducer*:
```javascript
const { setName } = $e.store.get( 'comments/test' ).actions;

$e.store.dispatch( setName( 'Elementor' ) ); // Will execute the `setName` reducer.

console.log( $e.store.getState() ['comments/test'].name ); // => 'Elementor'.
```

### [Back](../readme.md) 
