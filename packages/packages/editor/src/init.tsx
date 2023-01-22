import * as ReactDOM from 'react-dom';
import Shell from './components/shell';
import { StoreProvider, createStore } from '@elementor/store';
import { dispatchReadyEvent } from '@elementor/v1-adapters';

export default function init( domElement: HTMLElement ): void {
	const store = createStore();

	dispatchReadyEvent();

	ReactDOM.render( <StoreProvider store={ store }><Shell /></StoreProvider>, domElement );
}
