import * as React from 'react';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { sanitizeSvgMarkup } from './sanitize-svg-markup';

type IconLibraryGlyphProps = {
	icon: FontAwesome7Icon;
	size: number;
	color: string;
	label?: string;
};

export const IconLibraryGlyph = ( { icon, size, color, label }: IconLibraryGlyphProps ) => {
	const svgMarkup = icon.svgMarkup ? sanitizeSvgMarkup( icon.svgMarkup ) : null;

	if ( svgMarkup ) {
		return (
			<span
				aria-hidden={ label ? undefined : true }
				aria-label={ label }
				role={ label ? 'img' : undefined }
				style={ { width: size, height: size, color, display: 'inline-flex' } }
				dangerouslySetInnerHTML={ { __html: svgMarkup } }
			/>
		);
	}

	if ( icon.paths.length > 0 ) {
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

	if ( icon.glyphClass ) {
		return (
			<i
				className={ icon.glyphClass }
				aria-hidden={ label ? undefined : true }
				aria-label={ label }
				style={ { fontSize: size, color, lineHeight: 1 } }
			/>
		);
	}

	return null;
};
