import { __dispatch as dispatch } from '@elementor/store';

import { invalidateCache } from './component-config';
import { slice } from './components-styles-store';

export function removeComponentStyles( id: number ) {
	invalidateCache( id );
	dispatch( slice.actions.remove( { id } ) );
}
