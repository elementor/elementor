import * as React from 'react';

const FALLBACK_COLOR = 'rgba(0, 0, 0, 0.12)';
export const DASH = '2 2';

type CellProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	color?: string;
};

export function GridOutlineCell( { x, y, width, height, color }: CellProps ) {
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

type LineProps = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color?: string;
};

export function GridOutlineLine( { x1, y1, x2, y2, color }: LineProps ) {
	return (
		<line
			x1={ x1 }
			y1={ y1 }
			x2={ x2 }
			y2={ y2 }
			stroke={ color || FALLBACK_COLOR }
			strokeWidth={ 1 }
			strokeDasharray={ DASH }
			vectorEffect="non-scaling-stroke"
		/>
	);
}
