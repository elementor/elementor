## API - `$e.store`
*  **Description**: `$e.store` API is a global state manager that allows to create global states for components.
   It's actually a wrapper around [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started), and it uses [Slices](https://redux-toolkit.js.org/api/createslice) under the hood.
*  **Location**: *core/common/assets/js/api/core/store.js*
*  **Methods**:

| Method                        | Params                                         | Returns      | Description
|-------------------------------|------------------------------------------------|--------------|---------------------------------------------------------------------
| `$e.store.register()`         | `{String}` *sliceId*, `{Slice}` *instance*   	 | `{void}`     | Register a new [Redux Toolkit Slice](https://redux-toolkit.js.org/api/createslice).
| `$e.store.getAll()`           |                                                | `{Object}`   | Get all existing Slices IDs as a flat array.
| `$e.store.get()`              | `{String}` *sliceId*                           | `{Slice}`    | Get a specific Slice instance by its ID.
| `$e.store.getAllSlices()`     |                                                | `{Object}`   | Get all of the Slices.
| `$e.store.getReduxStore()`    |                                                | `{Object}`   | Get the actual [Redux Store](https://redux-toolkit.js.org/api/configureStore) object (mainly used for setting up a `<Provider />` in React).
| `$e.store.getState()`         |                                                | `{any}`      | Get the [current global state tree](https://redux.js.org/api/store#getstate).
| `$e.store.subscribe()`        | `{Function}` *listener*                        | `{function}` | [Subscribe](https://redux.js.org/api/store#subscribelistener) to state changes.
| `$e.store.dispatch()`         | `{Object}` *action*                            | `{Object}`   | [Dispatch](https://redux.js.org/api/store#dispatchaction) a Redux action.


## Guidelines & Conventions:
* Each Slice is owned by a [component](./components.md#guidelines-conventions--files-structure).
* Each [component](./components.md#guidelines-conventions--files-structure) can override the `defaultStates()` method to return a set of [Slices configurations](https://redux-toolkit.js.org/api/createslice) (e.g. `initialState` & `reducers`).
* The slices are identified by their key in the Slices definition object, and are prefixed with the component namespace to avoid conflicts (see example below).


## Example:
Defining and consuming a global state inside a component is fairly easy after understanding the basic concepts.
Here is an example of a component with basic Slices configuration:

```javascript
// Component code....

getNamespace() {
	return 'example';
}

defaultStates() {
	return {
		// A corresponding `Slice` instance will be available under `$e.store.get( 'example' )`.
		'': {
			initialState: {
				name: 'Elementor',
			},
			reducers: {
				setName: ( prev, { payload } ) => {
					return {
						...prev,
						name: payload,
					};
				},
			},
		},
		// A corresponding `Slice` instance will be available under `$e.store.get( 'example/counter' )`.
		counter: {
			initialState: {
				count: 0,
			},
			reducers: {
				// Override the previous `count` value.
				setCount: ( prev, { payload } ) => {
					return {
						...prev,
						count: payload,
					};
				},
				// Increment `count` by the value of `payload`.
				increment: ( prev, { payload } ) => ( {
					...prev,
					count: prev.count + payload,
				} ),
				// Decrement `count` by the value of `payload`.
				decrement: ( prev, { payload } ) => ( {
					...prev,
					count: prev.count - payload,
				} ),
			},
		},
	};
}

// More component code....
```

Later on, the `subscribe()` method can be used in order to listen to changes, and the`dispatch()` method (with the appropriate *Action*) in order to call a *Reducer*:
```javascript
const unsubscribe = $e.store.subscribe( () => {
	const state = $e.store.getState();

	console.log( state['example/counter'].count );
} );

const { setCount } = $e.store.get( 'example/counter' ).actions;

$e.store.dispatch( setCount( 10 ) ); // Will execute the `setCount` reducer.

// The subscriber function will log `10`.

unsubscribe(); // Will stop listening to changes.
```

The store can also be used inside a React application, just like the regular Redux store:
```javascript
import { Provider, useDispatch, useSelector } from 'react-redux';

function App( props ) {
	return (
		<Provider store={ $e.store.getReduxStore() }>
			<Counter name="Counter 1" />
			<Counter name="Counter 2" />
		</Provider>
	);
}

function Counter( props ) {
	const count = useSelector( ( state ) => state['example/counter'].count );
	const dispatch = useDispatch();
	const { actions } = $e.store.get( 'example/counter' );
	
	return (
		<div>
			<h1>{ props.name }</h1>
			<button onClick={ () => dispatch( actions.decrement( 1 ) ) }> - </button>
			<span>{ count }</span>
			<button onClick={ () => dispatch( actions.increment( 1 ) ) }> + </button>
		</div>
	);
}
```

### [Back](../readme.md) 
