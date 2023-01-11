import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { dispatchOnV1Ready } from '@elementor/v1-adapters';

export default function init( domElement: HTMLElement ): void {
	dispatchOnV1Ready();

	ReactDOM.render( <Shell />, domElement );
}
