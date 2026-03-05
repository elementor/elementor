import { createElementStyle, deleteElementStyle, getElementStyles, type V1Element } from '@elementor/editor-elements';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { getClassesProp, getTitleForContainers } from '../utils';

type ResetElementStyleArgs = {
	containers: V1Element[];
};

export const undoableResetElementStyle = () =>
	undoable(
		{
			do: ( { containers }: ResetElementStyleArgs ) => {
				return containers.map( ( container ) => {
					const elementId = container.model.get( 'id' );

					const containerStyles = getElementStyles( elementId );

					Object.keys( containerStyles ?? {} ).forEach( ( styleId ) =>
						deleteElementStyle( elementId, styleId )
					);

					return containerStyles;
				} );
			},

			undo: ( { containers }, revertDataItems ) => {
				containers.forEach( ( container, index ) => {
					const classesProp = getClassesProp( container );

					if ( ! classesProp ) {
						return;
					}

					const elementId = container.model.get( 'id' );
					const containerStyles = revertDataItems[ index ];

					Object.entries( containerStyles ?? {} ).forEach( ( [ styleId, style ] ) => {
						const [ firstVariant ] = style.variants;
						const additionalVariants = style.variants.slice( 1 );

						createElementStyle( {
							elementId,
							classesProp,
							styleId,
							label: ELEMENTS_STYLES_RESERVED_LABEL,
							...firstVariant,
							additionalVariants,
						} );
					} );
				} );
			},
		},
		{
			title: ( { containers } ) => getTitleForContainers( containers ),
			subtitle: __( 'Style Reset', 'elementor' ),
		}
	);
