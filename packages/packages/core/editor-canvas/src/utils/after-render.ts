import { getContainer } from '@elementor/editor-elements';

import { type TemplatedElementView } from '../legacy/types';

export function doAfterRender( elementIds: string[], callback: ( elementIds: string[] ) => void ): void {
	const pending = elementIds
		.map( ( elementId ) => {
			const view = getContainer( elementId )?.view;
			if ( ! view || ! hasDoAfterRender( view ) ) {
				return undefined;
			}

			return new Promise< void >( ( resolve ) => view._doAfterRender( resolve ) );
		} )
		.filter( Boolean );

	if ( pending.length > 0 ) {
		Promise.all( pending ).then( () => callback( elementIds ) );
	} else {
		callback( elementIds );
	}
}

function hasDoAfterRender( view: unknown ): view is TemplatedElementView {
	return typeof ( view as TemplatedElementView )?._doAfterRender === 'function';
}
