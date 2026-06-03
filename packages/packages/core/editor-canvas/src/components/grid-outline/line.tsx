import * as React from 'react';

const FALLBACK_COLOR = 'rgba(0, 0, 0, 0.12)';

type Props = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color?: string;
};

export function Line( { x1, y1, x2, y2, color }: Props ) {
	return (
		<line
			x1={ x1 }
			y1={ y1 }
			x2={ x2 }
			y2={ y2 }
			stroke={ color || FALLBACK_COLOR }
			strokeWidth={ 1 }
			strokeDasharray="2 2"
			vectorEffect="non-scaling-stroke"
		/>
	);
}
