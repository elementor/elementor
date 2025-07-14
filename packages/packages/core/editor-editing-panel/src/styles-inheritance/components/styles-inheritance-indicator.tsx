import * as React from 'react';
import { type ComponentProps } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { isEmpty, type PropType } from '@elementor/editor-props';
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY } from '@elementor/editor-styles-repository';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StyleIndicator } from '../../components/style-indicator';
import { useStyle } from '../../contexts/style-context';
import { useStylesInheritanceChain } from '../../contexts/styles-inheritance-context';
import { EXPERIMENTAL_FEATURES } from '../../sync/experiments-flags';
import { getStylesProviderThemeColor } from '../../utils/get-styles-provider-color';
import { isUsingIndicatorPopover } from '../consts';
import { type SnapshotPropValue } from '../types';
import { getValueFromInheritanceChain } from '../utils';
import { StylesInheritanceInfotip } from './styles-inheritance-infotip';

const skipControls = [ 'box-shadow', 'background-overlay', 'filter', 'backdrop-filter', 'transform' ];

const isUsingNestedProps = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 );

export const StylesInheritanceIndicator = () => {
	const { path, propType } = useBoundProp();

	const finalPath = isUsingNestedProps ? path : path.slice( 0, 1 );

	const inheritanceChain = useStylesInheritanceChain( finalPath );

	if ( ! path || path.some( ( pathItem ) => skipControls.includes( pathItem ) ) ) {
		return null;
	}

	if ( ! inheritanceChain.length ) {
		return null;
	}

	return <Indicator inheritanceChain={ inheritanceChain } path={ finalPath } propType={ propType } />;
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

	if (
		! isExperimentActive( EXPERIMENTAL_FEATURES.V_3_31 ) &&
		actualStyle.provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY
	) {
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

	if ( ! isUsingIndicatorPopover() ) {
		return (
			<Tooltip title={ __( 'Style origin', 'elementor' ) } placement="top">
				<StyleIndicator { ...styleIndicatorProps } aria-label={ label } />
			</Tooltip>
		);
	}

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
