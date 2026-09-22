import {
	type FontAwesome7IconDefinition,
	getFontAwesome7IconName,
	resolveFontAwesome7Icon,
} from '@elementor/editor-controls';

import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';
import { processSvgContent } from './process-svg-content';

const EMPTY_ICON_RESULT = { html: null, url: null };
const ICON_SVG_SIZE = '100%';
const ICON_SVG_OVERFLOW = 'visible';

type IconValue = {
	value?: unknown;
	library?: unknown;
};

export const iconTransformer = createTransformer( async ( value: IconValue, { signal }: TransformerOptions ) => {
	const iconValue = typeof value.value === 'string' ? value.value : null;
	const library = typeof value.library === 'string' ? value.library : null;

	if ( ! iconValue || ! library ) {
		return EMPTY_ICON_RESULT;
	}

	const iconName = getFontAwesome7IconName( iconValue );

	if ( ! iconName ) {
		return EMPTY_ICON_RESULT;
	}

	const iconData = await resolveFontAwesome7Icon( library, iconName, signal );

	if ( ! iconData ) {
		return EMPTY_ICON_RESULT;
	}

	const svgText = buildFontAwesomeSvg( iconData );

	if ( ! svgText ) {
		return EMPTY_ICON_RESULT;
	}

	const html = processIconSvgContent( svgText );

	return { html, url: null };
} );

function buildFontAwesomeSvg( iconData: FontAwesome7IconDefinition ): string | null {
	if ( iconData.paths.length === 0 ) {
		return null;
	}

	const pathMarkup = iconData.paths.map( ( path ) => `<path d="${ escapeSvgPath( path ) }"></path>` ).join( '' );

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ iconData.width } ${ iconData.height }">${ pathMarkup }</svg>`;
}

function escapeSvgPath( path: string ): string {
	return path.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function processIconSvgContent( svgText: string ): string | null {
	const html = processSvgContent( svgText );

	if ( ! html ) {
		return null;
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString( html, 'image/svg+xml' );
	const svgElement = doc.querySelector( 'svg' );

	if ( ! svgElement ) {
		return null;
	}

	svgElement.setAttribute( 'aria-hidden', 'true' );
	svgElement.style.setProperty( 'width', ICON_SVG_SIZE );
	svgElement.style.setProperty( 'height', ICON_SVG_SIZE );
	svgElement.style.setProperty( 'overflow', ICON_SVG_OVERFLOW );

	return svgElement.outerHTML;
}
