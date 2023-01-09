import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { createStore, getStore, StoreProvider, Store } from '@elementor/store';

export default function init( domElement: HTMLElement ): void {
	// Create the store singleton, that can not be re-created until running resetStore().
	createStore();

	// The store can't be null due to createStore() above.
	const store = getStore() as Store;

	ReactDOM.render( <StoreProvider store={ store }><Shell /></StoreProvider>, domElement );
}
