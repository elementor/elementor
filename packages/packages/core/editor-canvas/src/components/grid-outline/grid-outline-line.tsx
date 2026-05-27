import * as React from 'react';

// Fallback if `--e-a-border-color-bold` can't be resolved from the iframe
// (e.g. before the preview stylesheet loads).
const FALLBACK_COLOR = 'rgba(0, 0, 0, 0.12)';
// Mirrors the CSS `1px dashed` rendering used by `.elementor-first-add`.
export const DASH = '2 2';

type Props = {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
	color?: string;
};

export function GridOutlineLine( { x1, x2, y1, y2, color }: Props ) {
	return (
		<line
			x1={ x1 }
			x2={ x2 }
			y1={ y1 }
			y2={ y2 }
			stroke={ color || FALLBACK_COLOR }
			strokeWidth={ 1 }
			strokeDasharray={ DASH }
			vectorEffect="non-scaling-stroke"
		/>
	);
}
