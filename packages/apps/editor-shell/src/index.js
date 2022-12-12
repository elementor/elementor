import ReactDOM from 'react-dom';
import { Shell } from './components/shell';

console.log( 'loaded: editor-shell' );

export function render( element ) {
	ReactDOM.render( <Shell />, element );
}
