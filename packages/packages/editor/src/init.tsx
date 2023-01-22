import * as ReactDOM from 'react-dom';
import Shell from './components/shell';
import { dispatchReadyEvent } from '@elementor/v1-adapters';

export default function init( domElement: HTMLElement ): void {
	dispatchReadyEvent();

	ReactDOM.render( <Shell />, domElement );
}
