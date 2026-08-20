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
	if ( ! result ) {
		return;
	}

	const containers = Array.isArray( result ) ? result : [ result ];
	const elements = containers
		.map( ( container ) => container.model?.toJSON() as V1ElementData | undefined )
		.filter( ( element ): element is V1ElementData => !! element );

	loadComponentsAssets( elements );
}
