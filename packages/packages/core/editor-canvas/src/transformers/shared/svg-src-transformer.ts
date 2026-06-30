import DOMPurify from 'dompurify';
import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';

type SvgSrc = {
	id?: unknown;
	url?: unknown;
};

const SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: unset;';

function processSvgContent( svgText: string ): string | null {
	const sanitized = DOMPurify.sanitize( svgText, {
		USE_PROFILES: { svg: true, svgFilters: true },
	} );

	const parser = new DOMParser();
	const doc = parser.parseFromString( sanitized, 'image/svg+xml' );
	const svgElement = doc.querySelector( 'svg' );

	if ( ! svgElement ) {
		return null;
	}

	svgElement.setAttribute( 'fill', 'currentColor' );

	const existingStyle = svgElement.getAttribute( 'style' ) ?? '';
	const trimmed = existingStyle.trim();
	const merged = trimmed ? `${ trimmed.replace( /;$/, '' ) }; ${ SVG_INLINE_STYLES }` : SVG_INLINE_STYLES;
	svgElement.setAttribute( 'style', merged );

	return svgElement.outerHTML;
}

async function fetchSvgContent( url: string, signal?: AbortSignal ): Promise< string | null > {
	try {
		const response = await fetch( url, { signal } );

		if ( ! response.ok ) {
			return null;
		}

		const contentType = response.headers.get( 'content-type' ) ?? '';
		const isSvg = contentType.includes( 'svg' ) || contentType.includes( 'xml' ) || url.endsWith( '.svg' );

		if ( ! isSvg ) {
			return null;
		}

		return await response.text();
	} catch {
		return null;
	}
}

function resolveSvgSrcId( id: unknown ): number | null {
	if ( typeof id !== 'number' || id <= 0 ) {
		return null;
	}

	return id;
}

export const svgSrcTransformer = createTransformer( async ( value: SvgSrc, { signal }: TransformerOptions ) => {
	const id = resolveSvgSrcId( value.id );
	const urlFromValue = typeof value.url === 'string' ? value.url : null;

	let url: string | null | undefined = urlFromValue;

	if ( id && ! urlFromValue ) {
		const attachment = await getMediaAttachment( { id } );
		url = attachment?.url ?? null;
	}

	const resolvedUrl = typeof url === 'string' ? url : null;

	if ( ! resolvedUrl ) {
		return { html: null, url: null };
	}

	const svgText = await fetchSvgContent( resolvedUrl, signal );
	const html = svgText ? processSvgContent( svgText ) : null;

	return { html, url: resolvedUrl };
} );
