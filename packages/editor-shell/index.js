import ReactDOM from 'react-dom';
import { Editor } from './components/editor';

console.log( 'loaded: editor-shell' );

export function boot( element ) {
	ReactDOM.render( <Editor />, element );
}
