import * as React from 'react';
import { type PropKey } from '@elementor/editor-props';
import { type StyleDefinitionVariant } from '@elementor/editor-styles';
import { isElementsStylesProvider } from '@elementor/editor-styles-repository';
import { Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StyleIndicator } from '../../components/style-indicator';
import { useStyle } from '../../contexts/style-context';
import { useStylesInheritanceSnapshot } from '../../contexts/styles-inheritance-context';
import { getStylesProviderThemeColor } from '../../utils/get-styles-provider-color';
import { type SnapshotPropValue } from '../types';
type Props = {
	fields: PropKey[];
};

export const StylesInheritanceSectionIndicators = ( { fields }: Props ) => {
	const { id, meta, provider } = useStyle();
	const snapshot = useStylesInheritanceSnapshot();

	const snapshotFields = Object.fromEntries(
		Object.entries( snapshot ?? {} ).filter( ( [ key ] ) => fields.includes( key as PropKey ) )
	);

	const { hasValues, hasOverrides } = getIndicators( snapshotFields, id ?? '', meta );

	if ( ! hasValues && ! hasOverrides ) {
		return null;
	}

	const hasValueLabel = __( 'Has effective styles', 'elementor' );
	const hasOverridesLabel = __( 'Has overridden styles', 'elementor' );

	return (
		<Tooltip title={ __( 'Has styles', 'elementor' ) } placement="top">
			<Stack direction="row" sx={ { '& > *': { marginInlineStart: -0.25 } } } role="list">
				{ hasValues && provider && (
					<StyleIndicator
						getColor={ getStylesProviderThemeColor( provider.getKey() ) }
						data-variant={ isElementsStylesProvider( provider.getKey() ) ? 'local' : 'global' }
						role="listitem"
						aria-label={ hasValueLabel }
					/>
				) }
				{ hasOverrides && (
					<StyleIndicator
						isOverridden
						data-variant="overridden"
						role="listitem"
						aria-label={ hasOverridesLabel }
					/>
				) }
			</Stack>
		</Tooltip>
	);
};

function getIndicators(
	snapshotFields: Record< PropKey, SnapshotPropValue[] >,
	styleId: string,
	meta: StyleDefinitionVariant[ 'meta' ]
): { hasValues: boolean; hasOverrides: boolean } {
	let hasValues = false;
	let hasOverrides = false;

	Object.values( snapshotFields ).forEach( ( inheritanceChain ) => {
		const currentStyle = getCurrentStyleFromChain( inheritanceChain, styleId, meta );

		if ( ! currentStyle ) {
			return;
		}

		const [ actualStyle ] = inheritanceChain;

		if ( currentStyle === actualStyle ) {
			hasValues = true;
		} else {
			hasOverrides = true;
		}
	} );

	return { hasValues, hasOverrides };
}

function getCurrentStyleFromChain(
	chain: SnapshotPropValue[],
	styleId: string,
	meta: StyleDefinitionVariant[ 'meta' ]
): SnapshotPropValue | undefined {
	return chain.find(
		( {
			style: { id },
			variant: {
				meta: { breakpoint, state },
			},
		} ) => id === styleId && breakpoint === meta.breakpoint && state === meta.state
	);
}
