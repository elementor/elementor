import * as React from 'react';

const FALLBACK_COLOR = 'rgba(0, 0, 0, 0.12)';

type Props = {
	x: number;
	y: number;
	width: number;
	height: number;
	color?: string;
};

export function Cell( { x, y, width, height, color }: Props ) {
	return (
		<rect
			x={ x }
			y={ y }
			width={ width }
			height={ height }
			fill="none"
			stroke={ color || FALLBACK_COLOR }
			strokeWidth={ 1 }
			strokeDasharray="2 2"
			vectorEffect="non-scaling-stroke"
		/>
	);
}
