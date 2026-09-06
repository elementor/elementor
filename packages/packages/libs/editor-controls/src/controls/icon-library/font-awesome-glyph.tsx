import * as React from 'react';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';

type FontAwesomeGlyphProps = {
	icon: FontAwesome7Icon;
	size: number;
	color: string;
	label?: string;
};

export function FontAwesomeGlyph( { icon, size, color, label }: FontAwesomeGlyphProps ) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={ `0 0 ${ icon.width } ${ icon.height }` }
			width={ size }
			height={ size }
			fill={ color }
			overflow="visible"
			aria-hidden={ label ? undefined : true }
			aria-label={ label }
			role={ label ? 'img' : undefined }
		>
			{ icon.paths.map( ( path, index ) => (
				<path key={ `${ index }-${ path }` } d={ path } />
			) ) }
		</svg>
	);
}
