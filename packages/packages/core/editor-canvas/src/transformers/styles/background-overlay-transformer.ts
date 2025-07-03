import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { createTransformer } from '../create-transformer';
import { type BackgroundImageTransformed } from './background-image-overlay-transformer';

type BackgroundOverlay = ( BackgroundImageTransformed | string )[];

export type BackgroundOverlayTransformed = {
	'background-image'?: string | null;
	'background-repeat'?: string | null;
	'background-attachment'?: string | null;
	'background-size'?: string | null;
	'background-position'?: string | null;
};

export const backgroundOverlayTransformer = createTransformer(
	( value: BackgroundOverlay ): BackgroundOverlayTransformed | null => {
		if ( ! value || value.length === 0 ) {
			return null;
		}

		const normalizedValues = normalizeOverlayValues( value );

		if ( normalizedValues.length === 0 ) {
			return null;
		}

		const images = getValuesString( normalizedValues, 'src', 'none', true );
		const repeats = getValuesString( normalizedValues, 'repeat', 'repeat' );
		const attachments = getValuesString( normalizedValues, 'attachment', 'scroll' );
		const sizes = getValuesString( normalizedValues, 'size', 'auto auto' );
		const positions = getValuesString( normalizedValues, 'position', '0% 0%' );

		return {
			'background-image': images,
			'background-repeat': repeats,
			'background-attachment': attachments,
			'background-size': sizes,
			'background-position': positions,
		};
	}
);

function normalizeOverlayValues( overlays: BackgroundOverlay ): BackgroundImageTransformed[] {
	const isVersion330Active = isExperimentActive( 'e_v_3_30' );

	const mappedValues = overlays.map( ( item ) => {
		if ( typeof item === 'string' ) {
			return {
				src: item,
				repeat: null,
				attachment: null,
				size: null,
				position: null,
			};
		}

		return item;
	} );

	if ( ! isVersion330Active ) {
		return mappedValues;
	}

	return mappedValues.filter( ( item ) => item && !! item.src );
}

function getValuesString(
	items: Partial< BackgroundImageTransformed >[],
	prop: keyof BackgroundImageTransformed,
	defaultValue: string,
	preventUnification: boolean = false
) {
	const isVersion330Active = isExperimentActive( 'e_v_3_30' );
	const isEmpty = items.filter( ( item ) => item?.[ prop ] ).length === 0;

	if ( isEmpty ) {
		return isVersion330Active ? defaultValue : null;
	}

	const formattedValues = items.map( ( item ) => item[ prop ] ?? defaultValue );

	if ( ! preventUnification ) {
		const allSame = formattedValues.every( ( value ) => value === formattedValues[ 0 ] );

		if ( allSame ) {
			return formattedValues[ 0 ];
		}
	}

	return formattedValues.join( ',' );
}
