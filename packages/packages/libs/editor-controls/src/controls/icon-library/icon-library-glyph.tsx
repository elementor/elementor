import * as React from 'react';
import { styled } from '@elementor/ui';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { sanitizeSvgMarkup } from './sanitize-svg-markup';

type IconLibraryGlyphProps = {
	icon: FontAwesome7Icon;
	size: number;
	color: string;
	label?: string;
};

const SvgGlyphHost = styled( 'span' )( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	'& svg': {
		width: '100%',
		height: '100%',
		display: 'block',
		fill: 'currentColor',
	},
} );

export const IconLibraryGlyph = ( { icon, size, color, label }: IconLibraryGlyphProps ) => {
	const svgMarkup = icon.svgMarkup ? sanitizeSvgMarkup( icon.svgMarkup ) : null;
	const accessibilityProps = {
		'aria-hidden': label ? undefined : true,
		'aria-label': label,
		role: label ? 'img' : undefined,
	};

	if ( svgMarkup ) {
		return (
			<SvgGlyphHost
				{ ...accessibilityProps }
				style={ { width: size, height: size, color } }
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
				{ ...accessibilityProps }
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
				{ ...accessibilityProps }
				style={ {
					fontSize: size,
					color,
					lineHeight: 1,
					fontStyle: 'normal',
					fontWeight: 'normal',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: size,
					height: size,
				} }
			/>
		);
	}

	return null;
};
