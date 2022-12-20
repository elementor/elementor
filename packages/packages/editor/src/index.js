import ReactDOM from 'react-dom';
import { Shell } from './components/shell';

export function boot( element ) {
	ReactDOM.render( <Shell />, element );
}
