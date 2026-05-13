import { type V1Element, type V1ElementData } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { loadComponentsAssets } from '../store/actions/load-components-assets';

export function initLoadComponentDataAfterInstanceAdded() {
	registerDataHook( 'after', 'document/elements/paste', ( _args, result: V1Element | V1Element[] ) => {
		load( result );
	} );

	registerDataHook( 'after', 'document/elements/import', ( _args, result: V1Element | V1Element[] ) => {
		load( result );
	} );
}

function load( result: V1Element | V1Element[] ) {
	const containers = Array.isArray( result ) ? result : [ result ];

	loadComponentsAssets( containers.map( ( container ) => container.model.toJSON() as V1ElementData ) );
}
