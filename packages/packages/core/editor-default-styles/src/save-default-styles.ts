import { type AllowedHtmlTag } from './allowed-tags';
import { apiClient, type ApiContext } from './api';
import {
	selectData,
	selectFrontendInitialData,
	selectPreviewInitialData,
	slice,
	type StateWithDefaultStyles,
} from './store';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

function getChangedTags( state: StateWithDefaultStyles, context: ApiContext ): AllowedHtmlTag[] {
	const current = selectData( state );
	const initial =
		context === 'frontend' ? selectFrontendInitialData( state ) : selectPreviewInitialData( state );

	const changed: AllowedHtmlTag[] = [];

	Object.keys( current ).forEach( ( tag ) => {
		const currentStyle = current[ tag ];
		const initialStyle = initial[ tag ];

		if ( ! initialStyle || hash( currentStyle ) !== hash( initialStyle ) ) {
			changed.push( tag as AllowedHtmlTag );
		}
	});

	Object.keys( initial ).forEach( ( tag ) => {
		if ( ! current[ tag ] ) {
			changed.push( tag as AllowedHtmlTag );
		}
	} );

	return changed;
}

export async function saveDefaultStyles( context: ApiContext ) {
	const state = getState() as StateWithDefaultStyles;
	const data = selectData( state );
	const changedTags = getChangedTags( state, context );

	if ( context === 'frontend' ) {
		await apiClient.publish();
		dispatch( slice.actions.reset( { context: 'frontend' } ) );

		return;
	}

	await Promise.all(
		changedTags.map( async ( tag ) => {
			const style = data[ tag ];

			if ( ! style || style.variants.length === 0 ) {
				await apiClient.delete( tag, 'preview' );

				return;
			}

			await apiClient.put( tag, style.variants, 'preview' );
		} )
	);

	dispatch( slice.actions.reset( { context: 'preview' } ) );
}
