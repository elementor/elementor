import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { createStore, StoreProvider } from '@elementor/store';

export default function init( domElement: HTMLElement ): void {
	// Create the store singleton, that can not be re-created until running resetStore().
	const store = createStore();

	ReactDOM.render( <StoreProvider store={ store }><Shell /></StoreProvider>, domElement );
}
