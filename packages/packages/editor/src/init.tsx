import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { StoreProvider } from '@elementor/store';
import { storeService } from './index';

export default function init( domElement: HTMLElement ): void {
	const store = storeService.createStore();

	ReactDOM.render( <StoreProvider store={ store }><Shell /></StoreProvider>, domElement );
}
