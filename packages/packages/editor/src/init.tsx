import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { startV1Listeners } from '@elementor/v1-adapters';

export default function init( domElement: HTMLElement ): void {
	startV1Listeners();

	ReactDOM.render( <Shell />, domElement );
}
