import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { StoreProvider, createStore } from '@elementor/store';

export default function init( domElement: HTMLElement ): void {
	const store = createStore();

	ReactDOM.render( <StoreProvider store={ store }><Shell /></StoreProvider>, domElement );
}
