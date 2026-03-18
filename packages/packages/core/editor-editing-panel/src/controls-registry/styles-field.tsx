import * as React from 'react';
import { ControlAdornmentsProvider, PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { dimensionsPropTypeUtil, type PropKey, type PropValue, sizePropTypeUtil } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

import { useStylesInheritanceChain } from '../contexts/styles-inheritance-context';
import { getFieldIndicators } from '../field-indicators-registry';
import { useStylesField } from '../hooks/use-styles-field';
import { ConditionalField } from './conditional-field';
import { createTopLevelObjectType } from './create-top-level-object-type';

const DIMENSION_SIDES = [ 'block-start', 'block-end', 'inline-start', 'inline-end' ] as const;

/**
 * When a breakpoint inherits from a parent that only set *some* dimension sides, the remaining
 * sides should still show the next ancestor's value as a placeholder — not go blank.
 *
 * Example: Desktop = 10px (uniform). Tablet = inline-start 5px only. Mobile = no local value.
 * Without merging, mobile's Right / Bottom / Top placeholders would be empty because the closest
 * inherited value (tablet's partial dims) has no value for those sides.
 * With merging, we walk further up the chain and fill the gaps: inline-start gets 5px from tablet,
 * the other three sides get 10px from desktop's uniform size.
 *
 * Non-dimensions values (color, font-size, …) are returned as-is — no merging needed there.
 * @param chain
 * @param startIndex
 */
function buildResolvedPlaceholder( chain: { value: PropValue }[], startIndex: number ): PropValue | undefined {
	const firstEntry = chain[ startIndex ];
	if ( ! firstEntry ) {
		return undefined;
	}

	const firstValue = firstEntry.value;

	if ( ! dimensionsPropTypeUtil.isValid( firstValue ) ) {
		return firstValue;
	}

	const firstDims = dimensionsPropTypeUtil.extract( firstValue );

	if ( DIMENSION_SIDES.every( ( side ) => firstDims?.[ side ] !== null && firstDims?.[ side ] !== undefined ) ) {
		return firstValue;
	}

	const merged: Partial< Record< ( typeof DIMENSION_SIDES )[ number ], PropValue > > = {};
	DIMENSION_SIDES.forEach( ( side ) => {
		if ( firstDims?.[ side ] !== null && firstDims?.[ side ] !== undefined ) {
			merged[ side ] = firstDims[ side ];
		}
	} );

	for ( let i = startIndex + 1; i < chain.length; i++ ) {
		const val = chain[ i ].value;

		if ( sizePropTypeUtil.isValid( val ) ) {
			DIMENSION_SIDES.forEach( ( side ) => {
				if ( merged[ side ] === null || merged[ side ] === undefined ) {
					merged[ side ] = val;
				}
			} );
			break;
		} else if ( dimensionsPropTypeUtil.isValid( val ) ) {
			const dims = dimensionsPropTypeUtil.extract( val );
			DIMENSION_SIDES.forEach( ( side ) => {
				if ( ( merged[ side ] === null || merged[ side ] === undefined ) && dims?.[ side ] !== null && dims?.[ side ] !== undefined ) {
					merged[ side ] = dims[ side ];
				}
			} );
		}

		if ( DIMENSION_SIDES.every( ( side ) => merged[ side ] !== null && merged[ side ] !== undefined ) ) {
			break;
		}
	}

	return dimensionsPropTypeUtil.create( {
		'block-start': merged[ 'block-start' ] ?? null,
		'block-end': merged[ 'block-end' ] ?? null,
		'inline-start': merged[ 'inline-start' ] ?? null,
		'inline-end': merged[ 'inline-end' ] ?? null,
	} );
}

export type StylesFieldProps = {
	bind: PropKey;
	placeholder?: PropValue;
	children: React.ReactNode;
	propDisplayName: string;
};

export const StylesField = ( { bind, propDisplayName, children }: StylesFieldProps ) => {
	const stylesSchema = getStylesSchema();

	const stylesInheritanceChain = useStylesInheritanceChain( [ bind ] );

	const { value, canEdit, ...fields } = useStylesField( bind, { history: { propDisplayName } } );

	const propType = createTopLevelObjectType( { schema: stylesSchema } );

	// Placeholders represent the inherited value the user would see if they cleared their local
	// override. The chain is ordered most-specific-first, so when the current breakpoint has its
	// own value, chain[0] IS that value — showing it as a placeholder would be meaningless.
	// We skip to chain[1] so controls display what's truly inherited from parent breakpoints.
	//
	// buildResolvedPlaceholder also handles the case where the inherited value itself is a partial
	// dimensions (e.g. tablet only overrides inline-start): it merges subsequent chain entries to
	// fill the missing sides, so "Right / Bottom" inputs don't lose their inherited placeholder.
	const placeholderStartIndex = value ? 1 : 0;

	const placeholderValues = {
		[ bind ]: buildResolvedPlaceholder( stylesInheritanceChain, placeholderStartIndex ),
	};

	const setValue = ( newValue: Record< string, PropValue > ) => {
		fields.setValue( newValue[ bind ] );
	};

	return (
		<ControlAdornmentsProvider items={ getFieldIndicators( 'styles' ) }>
			<PropProvider
				propType={ propType }
				value={ { [ bind ]: value } }
				setValue={ setValue }
				placeholder={ placeholderValues }
				isDisabled={ () => ! canEdit }
			>
				<PropKeyProvider bind={ bind }>
					<ConditionalField>{ children }</ConditionalField>
				</PropKeyProvider>
			</PropProvider>
		</ControlAdornmentsProvider>
	);
};
