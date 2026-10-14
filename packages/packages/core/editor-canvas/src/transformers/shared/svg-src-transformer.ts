import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';
import { processSvgContent } from './process-svg-content';

type SvgSrc = {
	id?: unknown;
	url?: unknown;
};

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
