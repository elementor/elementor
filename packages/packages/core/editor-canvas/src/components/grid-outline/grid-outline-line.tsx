import * as React from 'react';

export const STROKE_COLOR = 'var(--e-a-border-color-bold, rgba(0, 0, 0, 0.12))';
export const DASH = '4 4';

type Props = {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
};

export function GridOutlineLine( { x1, x2, y1, y2 }: Props ) {
	return (
		<line
			x1={ x1 }
			x2={ x2 }
			y1={ y1 }
			y2={ y2 }
			stroke={ STROKE_COLOR }
			strokeWidth={ 1 }
			strokeDasharray={ DASH }
			vectorEffect="non-scaling-stroke"
		/>
	);
}
