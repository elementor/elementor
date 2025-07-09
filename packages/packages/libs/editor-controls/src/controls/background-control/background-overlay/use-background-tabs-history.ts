import { useRef } from 'react';
import {
	backgroundColorOverlayPropTypeUtil,
	backgroundGradientOverlayPropTypeUtil,
	backgroundImageOverlayPropTypeUtil,
	type BackgroundOverlayItemPropValue,
} from '@elementor/editor-props';
import { useTabs } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context';
import { type BackgroundImageOverlay } from './types';

type OverlayType = 'image' | 'gradient' | 'color';

type InitialBackgroundValues = {
	color: BackgroundOverlayItemPropValue[ 'value' ];
	image: BackgroundImageOverlay[ 'value' ];
	gradient: BackgroundOverlayItemPropValue[ 'value' ];
};

export const useBackgroundTabsHistory = ( {
	color: initialBackgroundColorOverlay,
	image: initialBackgroundImageOverlay,
	gradient: initialBackgroundGradientOverlay,
}: InitialBackgroundValues ) => {
	const { value: imageValue, setValue: setImageValue } = useBoundProp( backgroundImageOverlayPropTypeUtil );
	const { value: colorValue, setValue: setColorValue } = useBoundProp( backgroundColorOverlayPropTypeUtil );
	const { value: gradientValue, setValue: setGradientValue } = useBoundProp( backgroundGradientOverlayPropTypeUtil );

	const getCurrentOverlayType = (): OverlayType => {
		if ( colorValue ) {
			return 'color';
		}

		if ( gradientValue ) {
			return 'gradient';
		}

		return 'image';
	};

	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< OverlayType >( getCurrentOverlayType() );

	const valuesHistory = useRef< InitialBackgroundValues >( {
		image: initialBackgroundImageOverlay,
		color: initialBackgroundColorOverlay,
		gradient: initialBackgroundGradientOverlay,
	} );

	const saveToHistory = ( key: keyof InitialBackgroundValues, value: BackgroundOverlayItemPropValue[ 'value' ] ) => {
		if ( value ) {
			valuesHistory.current[ key ] = value;
		}
	};

	const onTabChange = ( e: React.SyntheticEvent, tabName: OverlayType ) => {
		switch ( tabName ) {
			case 'image':
				setImageValue( valuesHistory.current.image );

				saveToHistory( 'color', colorValue );
				saveToHistory( 'gradient', gradientValue );

				break;

			case 'gradient':
				setGradientValue( valuesHistory.current.gradient );

				saveToHistory( 'color', colorValue );
				saveToHistory( 'image', imageValue );

				break;

			case 'color':
				setColorValue( valuesHistory.current.color );

				saveToHistory( 'image', imageValue );
				saveToHistory( 'gradient', gradientValue );
		}

		return getTabsProps().onChange( e, tabName );
	};

	return {
		getTabProps,
		getTabPanelProps,
		getTabsProps: () => ( { ...getTabsProps(), onChange: onTabChange } ),
	};
};
