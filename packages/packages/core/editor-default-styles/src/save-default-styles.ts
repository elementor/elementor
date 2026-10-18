import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

import { type AllowedHtmlTag } from './allowed-tags';
import { apiClient } from './api';
import { getModifiedSections } from './modified-sections';
import { selectData, selectInitialData, selectIsDirty, slice, type StateWithDefaultStyles } from './store';
import { trackDefaultStyles } from './utils/tracking';

export function getChangedTags( state: StateWithDefaultStyles ): AllowedHtmlTag[] {
	const current = selectData( state );
	const initial = selectInitialData( state );

	const changed: AllowedHtmlTag[] = [];

	Object.keys( current ).forEach( ( tag ) => {
		const currentStyle = current[ tag ];
		const initialStyle = initial[ tag ];

		if ( ! initialStyle || hash( currentStyle ) !== hash( initialStyle ) ) {
			changed.push( tag as AllowedHtmlTag );
		}
	} );

	Object.keys( initial ).forEach( ( tag ) => {
		if ( ! current[ tag ] ) {
			changed.push( tag as AllowedHtmlTag );
		}
	} );

	return changed;
}

export async function saveDefaultStyles() {
	const state = getState() as StateWithDefaultStyles;

	if ( ! selectIsDirty( state ) ) {
		return;
	}

	const data = selectData( state );
	const initialData = selectInitialData( state );
	const changedTags = getChangedTags( state );

	await Promise.all(
		changedTags.map( async ( tag ) => {
			const style = data[ tag ];

			if ( ! style || style.variants.length === 0 ) {
				await apiClient.delete( tag );

				return;
			}

			await apiClient.put( tag, style.variants );
		} )
	).catch( ( error ) => {
		trackDefaultStyles( { event: 'saveFailed', tags_changed_count: changedTags.length } );

		throw error;
	} );

	changedTags.forEach( ( tag ) => {
		const isUnset = ! data[ tag ]?.variants.length;

		trackDefaultStyles( {
			event: 'tagSaved',
			tag,
			action: isUnset ? 'unset' : 'set',
			sections_modified: isUnset ? [] : getModifiedSections( initialData[ tag ], data[ tag ] ),
		} );
	} );

	dispatch( slice.actions.commit() );
}
