import { mergeProps, type Props } from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { ElementNotFoundError } from '../errors';
import { getContainer } from '../sync/get-container';
import { type SettingsVariant } from '../sync/types';
import { type ElementID } from '../types';
import { ELEMENT_SETTINGS_VARIANTS_CHANGE_EVENT } from './consts';

export type UpdateElementSettingsVariantArgs = {
	elementId: ElementID;
	breakpoint: string;
	props: Props;
};

export function updateElementSettingsVariant( { elementId, breakpoint, props }: UpdateElementSettingsVariantArgs ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new ElementNotFoundError( { context: { elementId } } );
	}

	const variants: SettingsVariant[] = structuredClone( container.model.get( 'settings_variants' ) ?? [] );
	const index = variants.findIndex( ( variant ) => variant.meta.breakpoint === breakpoint );

	if ( -1 === index ) {
		const nextProps = mergeProps( {}, props );

		if ( Object.keys( nextProps ).length > 0 ) {
			variants.push( {
				meta: { breakpoint },
				props: nextProps,
			} );
		}
	} else {
		const nextProps = mergeProps( variants[ index ].props, props );

		if ( Object.keys( nextProps ).length === 0 ) {
			variants.splice( index, 1 );
		} else {
			variants[ index ] = {
				meta: { breakpoint },
				props: nextProps,
			};
		}
	}

	container.model.set( 'settings_variants', variants );
	container.render?.();

	window.dispatchEvent( new CustomEvent( ELEMENT_SETTINGS_VARIANTS_CHANGE_EVENT ) );
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
}
