import {
	createElementStyle,
	deleteElementStyle,
	getElementStyles,
	updateElementStyle,
	type V1Element,
} from '@elementor/editor-elements';
import { type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { getClassesProp, getTitleForContainers } from '../../utils/command-utils';

type ElementStyleVariant = Omit< StyleDefinitionVariant, 'custom_css' > &
	Partial< Pick< StyleDefinitionVariant, 'custom_css' > >;

export type ElementStylesEntry = {
	container: V1Element;
	variants: ElementStyleVariant[];
};

type ApplyElementStylesArgs = {
	entries: ElementStylesEntry[];
	subtitle: string;
};

type PasteElementStyleArgs = {
	containers: V1Element[];
	newStyle: StyleDefinition;
};

export const undoableApplyElementStyles = () =>
	undoable(
		{
			do: ( { entries }: ApplyElementStylesArgs ) => {
				return entries.map( ( { container, variants } ) => {
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
						variants.forEach( ( variant ) => {
							updateElementStyle( {
								elementId,
								styleId,
								...variant,
							} );
						} );
					} else {
						const [ firstVariant, ...additionalVariants ] = variants.map( ( variant ) => ( {
							...variant,
							custom_css: variant.custom_css ?? null,
						} ) );

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

			undo: ( { entries }, revertDataItems ) => {
				entries.forEach( ( { container }, index ) => {
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
			title: ( { entries } ) => getTitleForContainers( entries.map( ( { container } ) => container ) ),
			subtitle: ( { subtitle } ) => subtitle,
		}
	);

export const undoablePasteElementStyle = () => {
	const applyElementStyles = undoableApplyElementStyles();

	return ( { containers, newStyle }: PasteElementStyleArgs ) =>
		applyElementStyles( {
			entries: containers.map( ( container ) => ( { container, variants: newStyle.variants } ) ),
			subtitle: __( 'Style Pasted', 'elementor' ),
		} );
};
