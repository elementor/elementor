import * as React from 'react';
import { useRef } from 'react';
import { type StringPropValue } from '@elementor/editor-props';
import { type ToggleButtonProps, useTheme } from '@elementor/ui';

import { useStylesField } from '../../../../hooks/use-styles-field';
import type { FlexDirection } from '../flex-direction-field';

type Props = {
	icon: React.JSX.ElementType;
	size: ToggleButtonProps[ 'size' ];
	isClockwise?: boolean;
	offset?: number;
	disableRotationForReversed?: boolean;
};

const CLOCKWISE_ANGLES: Record< FlexDirection, number > = {
	row: 0,
	column: 90,
	'row-reverse': 180,
	'column-reverse': 270,
};

const COUNTER_CLOCKWISE_ANGLES: Record< FlexDirection, number > = {
	row: 0,
	column: -90,
	'row-reverse': -180,
	'column-reverse': -270,
};

export const RotatedIcon = ( {
	icon: Icon,
	size,
	isClockwise = true,
	offset = 0,
	disableRotationForReversed = false,
}: Props ) => {
	const rotate = useRef( useGetTargetAngle( isClockwise, offset, disableRotationForReversed ) );

	rotate.current = useGetTargetAngle( isClockwise, offset, disableRotationForReversed, rotate );

	return <Icon fontSize={ size } sx={ { transition: '.3s', rotate: `${ rotate.current }deg` } } />;
};

const useGetTargetAngle = (
	isClockwise: boolean,
	offset: number,
	disableRotationForReversed: boolean,
	existingRef?: React.MutableRefObject< number >
) => {
	const { value: direction } = useStylesField< StringPropValue >( 'flex-direction' );
	const isRtl = 'rtl' === useTheme().direction;
	const rotationMultiplier = isRtl ? -1 : 1;
	const angleMap = isClockwise ? CLOCKWISE_ANGLES : COUNTER_CLOCKWISE_ANGLES;

	const currentDirection = ( direction?.value as FlexDirection ) || 'row';
	const currentAngle = existingRef ? existingRef.current * rotationMultiplier : angleMap[ currentDirection ] + offset;
	const targetAngle = angleMap[ currentDirection ] + offset;

	const diffToTargetAngle = ( targetAngle - currentAngle + 360 ) % 360;
	const formattedDiff = ( ( diffToTargetAngle + 180 ) % 360 ) - 180;

	if ( disableRotationForReversed && [ 'row-reverse', 'column-reverse' ].includes( currentDirection ) ) {
		return 0;
	}

	return ( currentAngle + formattedDiff ) * rotationMultiplier;
};
