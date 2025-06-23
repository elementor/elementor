import * as React from 'react';
import {
	backgroundGradientOverlayPropTypeUtil,
	type BackgroundGradientOverlayPropValue,
	type BackgroundOverlayItemPropValue,
	colorPropTypeUtil,
	type ColorPropValue,
	colorStopPropTypeUtil,
	gradientColorStopPropTypeUtil,
	numberPropTypeUtil,
	type NumberPropValue,
	stringPropTypeUtil,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { UnstableGradientBox } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import ControlActions from '../../control-actions/control-actions';
import { createControl } from '../../create-control';

export type ColorStop = TransformablePropValue<
	'color-stop',
	{
		color: ColorPropValue;
		offset: NumberPropValue;
	}
>;

export const BackgroundGradientColorControl = createControl( () => {
	const { value, setValue } = useBoundProp( backgroundGradientOverlayPropTypeUtil );

	const handleChange = ( newValue: BackgroundGradientOverlayPropValue[ 'value' ] ) => {
		const transformedValue = createTransformableValue( newValue );

		if ( transformedValue.positions ) {
			transformedValue.positions = stringPropTypeUtil.create( newValue.positions.join( ' ' ) );
		}

		setValue( transformedValue );
	};

	// TODO: To support Global variables this won't be needed when we have a flexible Gradient Box
	const createTransformableValue = ( newValue: BackgroundGradientOverlayPropValue[ 'value' ] ) => ( {
		...newValue,
		type: stringPropTypeUtil.create( newValue.type ),
		angle: numberPropTypeUtil.create( newValue.angle ),
		stops: gradientColorStopPropTypeUtil.create(
			newValue.stops.map( ( { color, offset }: { color: string; offset: number } ) =>
				colorStopPropTypeUtil.create( {
					color: colorPropTypeUtil.create( color ),
					offset: numberPropTypeUtil.create( offset ),
				} )
			)
		),
	} );

	// TODO: To support Global variables this won't be needed when we have a flexible Gradient Box
	const normalizeValue = () => {
		if ( ! value ) {
			return;
		}

		const { type, angle, stops, positions } = value;

		return {
			type: type.value,
			angle: angle.value,
			stops: stops.value.map( ( { value: { color, offset } }: ColorStop ) => ( {
				color: color.value,
				offset: offset.value,
			} ) ),
			positions: positions?.value.split( ' ' ),
		};
	};

	return (
		<ControlActions>
			<UnstableGradientBox
				sx={ { width: 'auto', padding: 1.5 } }
				value={ normalizeValue() }
				onChange={ handleChange }
			/>
		</ControlActions>
	);
} );

export const initialBackgroundGradientOverlay: BackgroundOverlayItemPropValue =
	backgroundGradientOverlayPropTypeUtil.create( {
		type: stringPropTypeUtil.create( 'linear' ),
		angle: numberPropTypeUtil.create( 180 ),
		stops: gradientColorStopPropTypeUtil.create( [
			colorStopPropTypeUtil.create( {
				color: colorPropTypeUtil.create( 'rgb(0,0,0)' ),
				offset: numberPropTypeUtil.create( 0 ),
			} ),
			colorStopPropTypeUtil.create( {
				color: colorPropTypeUtil.create( 'rgb(255,255,255)' ),
				offset: numberPropTypeUtil.create( 100 ),
			} ),
		] ),
	} );
