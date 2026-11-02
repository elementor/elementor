import { useLayoutEffect } from 'react';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

import { type StyleItem } from '../renderers/create-styles-renderer';
import { removeProviderPregeneratedLinks } from '../utils/pregenerated-links-removal';

type RenderedProviders = Record< string, { provider: StylesProvider; items: StyleItem[] } >;

// The pregenerated <link /> css can only be dropped once the client-side <style /> tags replacing it are committed
// into the canvas, otherwise the canvas is painted without any of the provider's styles.
export function usePregeneratedLinksHandoff(
	canvasHead: HTMLElement | null | undefined,
	renderedProviders: RenderedProviders
) {
	useLayoutEffect( () => {
		if ( ! isCurrentCanvasHead( canvasHead ) ) {
			return;
		}

		Object.entries( renderedProviders ).forEach( ( [ providerKey, { provider, items } ] ) => {
			if ( items.length > 0 && provider.isPregeneratedLink ) {
				removeProviderPregeneratedLinks( providerKey, provider.isPregeneratedLink );
			}
		} );
	}, [ canvasHead, renderedProviders ] );
}

// The portal container is resolved before the preview document replaces the iframe's initial document,
// so a stale head would let the live canvas lose its pregenerated links while the styles render elsewhere.
function isCurrentCanvasHead( canvasHead?: HTMLElement | null ): canvasHead is HTMLElement {
	return !! canvasHead && canvasHead === getCanvasIframeDocument()?.head;
}
