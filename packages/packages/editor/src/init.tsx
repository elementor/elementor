import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { createStore, getStore, StoreProvider, Store } from '@elementor/store';

export default function init( domElement: HTMLElement ): void {
	createStore();

	// The store can't be null due to createStore() above.
	const store = getStore() as Store;

	ReactDOM.render( <StoreProvider store={ store }><Shell /></StoreProvider>, domElement );
}
