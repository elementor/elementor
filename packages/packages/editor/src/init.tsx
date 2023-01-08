import ReactDOM from 'react-dom';
import Shell from './components/shell';

export default function init( domElement: HTMLElement ) {
	ReactDOM.render( <Shell />, domElement );
}
