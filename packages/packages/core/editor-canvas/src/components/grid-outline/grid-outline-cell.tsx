import * as React from 'react';

const FALLBACK_COLOR = 'rgba(0, 0, 0, 0.12)';
export const DASH = '2 2';

type Props = {
	x: number;
	y: number;
	width: number;
	height: number;
	color?: string;
};

export function GridOutlineCell( { x, y, width, height, color }: Props ) {
	return (
		<rect
			x={ x }
			y={ y }
			width={ width }
			height={ height }
			fill="none"
			stroke={ color || FALLBACK_COLOR }
			strokeWidth={ 1 }
			strokeDasharray={ DASH }
			vectorEffect="non-scaling-stroke"
		/>
	);
}
