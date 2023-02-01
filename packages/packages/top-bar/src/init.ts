import { injectIntoTop } from '@elementor/editor';
import TopBar from './components/top-bar';

injectIntoTop( {
	name: 'top-bar',
	filler: TopBar,
} );
