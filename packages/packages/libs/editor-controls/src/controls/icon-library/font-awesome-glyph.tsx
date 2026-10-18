import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from '@elementor/ui';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { resolveProviderIconPreviewSvg } from './icon-library-providers';
import { sanitizeIconSvgMarkup } from './sanitize-icon-svg-markup';

type FontAwesomeGlyphProps = {
	icon: FontAwesome7Icon;
	size: number;
	color: string;
	label?: string;
};

export const FontAwesomeGlyph = ( props: FontAwesomeGlyphProps ) => {
	const { icon } = props;

	if ( icon.lazySvg && ! icon.svgMarkup ) {
		return <LazyProviderGlyph { ...props } />;
	}

	return <ResolvedGlyph { ...props } />;
};

const LazyProviderGlyph = ( props: FontAwesomeGlyphProps ) => {
	const { icon } = props;
	const [ svgMarkup, setSvgMarkup ] = useState< string | null >( null );

	useEffect( () => {
		const controller = new AbortController();

		setSvgMarkup( null );

		resolveProviderIconPreviewSvg( icon.library, icon.value, controller.signal )
			.then( ( markup ) => ! controller.signal.aborted && setSvgMarkup( markup ) )
			.catch( () => {} );

		return () => controller.abort();
	}, [ icon.library, icon.value ] );

	if ( ! svgMarkup ) {
		return null;
	}

	return <ResolvedGlyph { ...props } icon={ { ...icon, svgMarkup } } />;
};

const ResolvedGlyph = ( { icon, size, color, label }: FontAwesomeGlyphProps ) => {
	const svgMarkup = sanitizeIconSvgMarkup( icon.svgMarkup );

	if ( svgMarkup ) {
		return (
			<Box
				component="span"
				aria-hidden={ label ? undefined : true }
				aria-label={ label }
				role={ label ? 'img' : undefined }
				sx={ {
					width: size,
					height: size,
					color,
					display: 'inline-flex',
					'& svg': {
						width: '100%',
						height: '100%',
						fill: 'currentColor',
					},
					'& path': {
						fill: 'currentColor',
					},
				} }
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
