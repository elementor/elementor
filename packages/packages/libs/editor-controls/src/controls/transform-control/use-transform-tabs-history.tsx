import { useRef } from 'react';
import {
	moveTransformPropTypeUtil,
	type MoveTransformPropValue,
	rotateTransformPropTypeUtil,
	type RotateTransformPropValue,
	scaleTransformPropTypeUtil,
	type ScaleTransformPropValue,
	skewTransformPropTypeUtil,
	type SkewTransformPropValue,
	type TransformItemPropValue,
} from '@elementor/editor-props';
import { useTabs } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { type TransformFunction, TransformFunctionKeys } from './types';

type InitialTransformValues = {
	move: TransformItemPropValue[ 'value' ];
	scale: TransformItemPropValue[ 'value' ];
	rotate: TransformItemPropValue[ 'value' ];
	skew: TransformItemPropValue[ 'value' ];
};

export const useTransformTabsHistory = ( {
	move: initialMove,
	scale: initialScale,
	rotate: initialRotate,
	skew: initialSkew,
}: InitialTransformValues ) => {
	const { value: moveValue, setValue: setMoveValue } = useBoundProp( moveTransformPropTypeUtil );
	const { value: scaleValue, setValue: setScaleValue } = useBoundProp( scaleTransformPropTypeUtil );
	const { value: rotateValue, setValue: setRotateValue } = useBoundProp( rotateTransformPropTypeUtil );
	const { value: skewValue, setValue: setSkewValue } = useBoundProp( skewTransformPropTypeUtil );

	const getCurrentTransformType = (): TransformFunction => {
		switch ( true ) {
			case !! scaleValue:
				return TransformFunctionKeys.scale;
			case !! rotateValue:
				return TransformFunctionKeys.rotate;
			case !! skewValue:
				return TransformFunctionKeys.skew;
			default:
				return TransformFunctionKeys.move;
		}
	};

	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< TransformFunction >( getCurrentTransformType() );

	const valuesHistory = useRef< InitialTransformValues >( {
		move: initialMove,
		scale: initialScale,
		rotate: initialRotate,
		skew: initialSkew,
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
				saveToHistory( 'rotate', rotateValue );
				saveToHistory( 'skew', skewValue );

				break;

			case TransformFunctionKeys.scale:
				setScaleValue( valuesHistory.current.scale as ScaleTransformPropValue[ 'value' ] );
				saveToHistory( 'move', moveValue );
				saveToHistory( 'rotate', rotateValue );
				saveToHistory( 'skew', skewValue );

				break;

			case TransformFunctionKeys.rotate:
				setRotateValue( valuesHistory.current.rotate as RotateTransformPropValue[ 'value' ] );
				saveToHistory( 'move', moveValue );
				saveToHistory( 'scale', scaleValue );
				saveToHistory( 'skew', skewValue );

				break;

			case TransformFunctionKeys.skew:
				setSkewValue( valuesHistory.current.skew as SkewTransformPropValue[ 'value' ] );
				saveToHistory( 'move', moveValue );
				saveToHistory( 'scale', scaleValue );
				saveToHistory( 'rotate', rotateValue );

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
