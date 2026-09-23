import * as React from 'react';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';

type FontAwesomeGlyphProps = {
	icon: FontAwesome7Icon;
	size: number;
	color: string;
	label?: string;
};

export const FontAwesomeGlyph = ( { icon, size, color, label }: FontAwesomeGlyphProps ) => {
	if ( icon.svgMarkup ) {
		return (
			<span
				aria-hidden={ label ? undefined : true }
				aria-label={ label }
				role={ label ? 'img' : undefined }
				style={ { width: size, height: size, color, display: 'inline-flex' } }
				dangerouslySetInnerHTML={ { __html: icon.svgMarkup } }
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
