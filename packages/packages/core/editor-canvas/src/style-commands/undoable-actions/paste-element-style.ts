import {
	createElementStyle,
	deleteElementStyle,
	getElementStyles,
	updateElementStyle,
	type V1Element,
} from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { getClassesProp, getTitleForContainers } from '../utils';

type PasteElementStyleArgs = {
	containers: V1Element[];
	newStyle: StyleDefinition;
};

export const undoablePasteElementStyle = () =>
	undoable(
		{
			do: ( { containers, newStyle }: PasteElementStyleArgs ) => {
				return containers.map( ( container ) => {
					const elementId = container.id;
					const classesProp = getClassesProp( container );

					if ( ! classesProp ) {
						return null;
					}

					const originalStyles = getElementStyles( container.id );

					const [ styleId, styleDef ] = Object.entries( originalStyles ?? {} )[ 0 ] ?? []; // we currently support only one local style
					const originalStyle = Object.keys( styleDef ?? {} ).length ? styleDef : null;

					const revertData = {
						styleId,
						originalStyle,
					};

					if ( styleId ) {
						newStyle.variants.forEach( ( { meta, props } ) => {
							updateElementStyle( {
								elementId,
								styleId,
								meta,
								props,
							} );
						} );
					} else {
						const [ firstVariant ] = newStyle.variants;
						const additionalVariants = newStyle.variants.slice( 1 );

						revertData.styleId = createElementStyle( {
							elementId,
							classesProp,
							label: ELEMENTS_STYLES_RESERVED_LABEL,
							...firstVariant,
							additionalVariants,
						} );
					}

					return revertData;
				} );
			},

			undo: ( { containers }, revertDataItems ) => {
				containers.forEach( ( container, index ) => {
					const revertData = revertDataItems[ index ];

					if ( ! revertData ) {
						return;
					}

					if ( ! revertData.originalStyle ) {
						// the container didn't have a style before pasting the new style
						deleteElementStyle( container.id, revertData.styleId );

						return;
					}

					const classesProp = getClassesProp( container );

					if ( ! classesProp ) {
						return;
					}

					const [ firstVariant ] = revertData.originalStyle.variants;
					const additionalVariants = revertData.originalStyle.variants.slice( 1 );

					createElementStyle( {
						elementId: container.id,
						classesProp,
						label: ELEMENTS_STYLES_RESERVED_LABEL,
						styleId: revertData.styleId,
						...firstVariant,
						additionalVariants,
					} );
				} );
			},
		},
		{
			title: ( { containers } ) => getTitleForContainers( containers ),
			subtitle: __( 'Style Pasted', 'elementor' ),
		}
	);
