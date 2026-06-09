import * as React from 'react';

import { type CellRect } from '../../utils/grid-outline-utils';

const COLOR = '#9DA5AE';
const GLYPH_SIZE = 19;

type Props = {
	rect: CellRect;
};

export function FirstEmptyCell( { rect }: Props ) {
	const size = Math.min( GLYPH_SIZE, rect.width, rect.height );

	if ( size <= 0 ) {
		return null;
	}

	const centerX = rect.x + rect.width / 2;
	const centerY = rect.y + rect.height / 2;

	return (
		<i
			className="eicon-plus"
			aria-hidden="true"
			style={ {
				position: 'absolute',
				left: centerX,
				top: centerY,
				transform: 'translate(-50%, -50%)',
				fontSize: size,
				color: COLOR,
				lineHeight: 1,
				pointerEvents: 'none',
			} }
		/>
	);
}
