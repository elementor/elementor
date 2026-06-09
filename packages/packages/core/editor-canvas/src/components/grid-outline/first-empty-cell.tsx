import * as React from 'react';

import { type CellRect } from '../../utils/grid-outline-utils';

const FALLBACK_COLOR = 'rgba(0, 0, 0, 0.36)';
const GLYPH_SIZE = 16;

type Props = {
	rect: CellRect;
	color?: string;
};

export function FirstEmptyCell( { rect, color }: Props ) {
	const size = Math.min( GLYPH_SIZE, rect.width, rect.height );

	if ( size <= 0 ) {
		return null;
	}

	const half = size / 2;
	const centerX = rect.x + rect.width / 2;
	const centerY = rect.y + rect.height / 2;
	const stroke = color || FALLBACK_COLOR;

	return (
		<g pointerEvents="none">
			<line
				x1={ centerX - half }
				y1={ centerY }
				x2={ centerX + half }
				y2={ centerY }
				stroke={ stroke }
				strokeWidth={ 1.5 }
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={ centerX }
				y1={ centerY - half }
				x2={ centerX }
				y2={ centerY + half }
				stroke={ stroke }
				strokeWidth={ 1.5 }
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
		</g>
	);
}
