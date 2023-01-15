import * as ReactDOM from 'react-dom';
import Shell from './components/shell';

export default function init( domElement: HTMLElement ): void {
	ReactDOM.render( <Shell />, domElement );
}
