import { type Unit } from '@elementor/editor-controls';
import { type ElementInteractions } from '@elementor/editor-elements';
import {
	isTransformable,
	numberPropTypeUtil,
	type PropValue,
	type SizePropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';

import { convertTimeUnit } from '../../utils/time-conversion';

type Normalizer = ( value: TransformablePropValue< string > ) => PropValue;

const FIELD_NORMALIZERS: Record< string, Normalizer > = {
	size: ( value ) => {
		const sizeProp = value as SizePropValue;
		const { size, unit } = sizeProp.value;
		const numberPropValue = convertTimeUnit( size as number, unit as Unit, 'ms' );

		return numberPropTypeUtil.create( numberPropValue );
	},
};

export const normalizeInteractions = ( interactions?: ElementInteractions ): ElementInteractions | undefined => {
	if ( ! interactions ) {
		return;
	}

	if ( interactions.items.length === 0 ) {
		return interactions;
	}

	return {
		...interactions,
		items: interactions.items.map( normalize ),
	} as ElementInteractions;
};

const normalize = ( interactions: any ) => {
	
	// interactions.value.animation.value.timing_config.value = { 
	// 	duration: { $$type: 'number', value: 600 },
	// 	delay: { $$type: 'number', value: 0 }
	// };

	console.log( interactions );

	return interactions;
};

const normalizeNode = ( node: PropValue ): PropValue => {
	if ( Array.isArray( node ) ) {
		return node.map( normalizeNode );
	}

	if ( node !== null && typeof node === 'object' ) {
		if ( isTransformable( node ) && node.value !== undefined ) {
			const normalizer = FIELD_NORMALIZERS[ node.$$type ];

			if ( normalizer ) {
				return normalizer( node as TransformablePropValue< string > );
			}
		}

		const typedNode = node as Record< string, unknown >;
		const out: Record< string, PropValue > = {};

		for ( const k in typedNode ) {
			out[ k ] = normalizeNode( typedNode[ k ] as PropValue );
		}

		return out;
	}

	return node;
};
