import * as React from 'react';
import { type ComponentProps } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { isEmpty, type PropType } from '@elementor/editor-props';
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY } from '@elementor/editor-styles-repository';
import { __ } from '@wordpress/i18n';

import { StyleIndicator } from '../../components/style-indicator';
import { useStyle } from '../../contexts/style-context';
import { useStylesInheritanceChain } from '../../contexts/styles-inheritance-context';
import { getStylesProviderThemeColor } from '../../utils/get-styles-provider-color';
import { type SnapshotPropValue } from '../types';
import { getValueFromInheritanceChain } from '../utils';
import { StylesInheritanceInfotip } from './styles-inheritance-infotip';

const skipControls = [ 'box-shadow', 'background-overlay', 'filter', 'backdrop-filter', 'transform' ];

export const StylesInheritanceIndicator = () => {
	const { path, propType } = useBoundProp();

	const inheritanceChain = useStylesInheritanceChain( path );

	if ( ! path || path.some( ( pathItem ) => skipControls.includes( pathItem ) ) || ! inheritanceChain.length ) {
		return null;
	}

	return <Indicator inheritanceChain={ inheritanceChain } path={ path } propType={ propType } />;
};

type IndicatorProps = {
	inheritanceChain: SnapshotPropValue[];
	path: string[];
	propType: PropType;
};

const Indicator = ( { inheritanceChain, path, propType }: IndicatorProps ) => {
	const { id: currentStyleId, provider: currentStyleProvider, meta: currentStyleMeta } = useStyle();

	const currentItem = currentStyleId
		? getValueFromInheritanceChain( inheritanceChain, currentStyleId, currentStyleMeta )
		: null;

	const hasValue = ! isEmpty( currentItem?.value );

	const [ actualStyle ] = inheritanceChain;

	if ( actualStyle.provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY ) {
		return null;
	}

	const isFinalValue = currentItem === actualStyle;

	const label = getLabel( { isFinalValue, hasValue } );

	const styleIndicatorProps: ComponentProps< typeof StyleIndicator > = {
		getColor:
			isFinalValue && currentStyleProvider
				? getStylesProviderThemeColor( currentStyleProvider.getKey() )
				: undefined,
		isOverridden: hasValue && ! isFinalValue ? true : undefined,
	};

	return (
		<StylesInheritanceInfotip
			inheritanceChain={ inheritanceChain }
			path={ path }
			propType={ propType }
			label={ label }
		>
			<StyleIndicator { ...styleIndicatorProps } />
		</StylesInheritanceInfotip>
	);
};

const getLabel = ( { isFinalValue, hasValue }: { isFinalValue: boolean; hasValue: boolean } ) => {
	if ( isFinalValue ) {
		return __( 'This is the final value', 'elementor' );
	}

	if ( hasValue ) {
		return __( 'This value is overridden by another style', 'elementor' );
	}

	return __( 'This has value from another style', 'elementor' );
};
