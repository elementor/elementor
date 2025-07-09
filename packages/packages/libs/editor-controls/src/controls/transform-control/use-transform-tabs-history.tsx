import { useRef } from 'react';
import {
	moveTransformPropTypeUtil,
	type MoveTransformPropValue,
	scaleTransformPropTypeUtil,
	type ScaleTransformPropValue,
	type TransformItemPropValue,
} from '@elementor/editor-props';
import { useTabs } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { type TransformFunction, TransformFunctionKeys } from './types';

type InitialTransformValues = {
	move: TransformItemPropValue[ 'value' ];
	scale: TransformItemPropValue[ 'value' ];
};

export const useTransformTabsHistory = ( { move: initialMove, scale: initialScale }: InitialTransformValues ) => {
	const { value: moveValue, setValue: setMoveValue } = useBoundProp( moveTransformPropTypeUtil );
	const { value: scaleValue, setValue: setScaleValue } = useBoundProp( scaleTransformPropTypeUtil );

	const getCurrentTransformType = (): TransformFunction => {
		switch ( true ) {
			case !! scaleValue:
				return TransformFunctionKeys.scale;
			default:
				return TransformFunctionKeys.move;
		}
	};

	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< TransformFunction >( getCurrentTransformType() );

	const valuesHistory = useRef< InitialTransformValues >( {
		move: initialMove,
		scale: initialScale,
	} );

	const saveToHistory = ( key: keyof InitialTransformValues, value: TransformItemPropValue[ 'value' ] ) => {
		if ( value ) {
			valuesHistory.current[ key ] = value;
		}
	};

	const onTabChange = ( e: React.SyntheticEvent, tabName: TransformFunction ) => {
		switch ( tabName ) {
			case TransformFunctionKeys.move:
				setMoveValue( valuesHistory.current.move as MoveTransformPropValue[ 'value' ] );
				saveToHistory( 'scale', scaleValue );

				break;

			case TransformFunctionKeys.scale:
				setScaleValue( valuesHistory.current.scale as ScaleTransformPropValue[ 'value' ] );
				saveToHistory( 'move', moveValue );

				break;
		}

		return getTabsProps().onChange( e, tabName );
	};

	return {
		getTabProps,
		getTabPanelProps,
		getTabsProps: () => ( { ...getTabsProps(), onChange: onTabChange } ),
	};
};
