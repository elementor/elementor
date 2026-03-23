import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

const removedProviderKeys = new Set< string >();

export function removeProviderPregeneratedLinks( providerKey: string, pattern: RegExp ): void {
	if ( removedProviderKeys.has( providerKey ) ) {
		return;
	}

	const iframeDocument = getCanvasIframeDocument();

	if ( ! iframeDocument ) {
		return;
	}

	const links = iframeDocument.head.querySelectorAll< HTMLLinkElement >( 'link[rel="stylesheet"]' );

	links.forEach( ( link ) => {
		const id = link.getAttribute( 'id' ) ?? '';

		if ( pattern.test( id ) ) {
			link.remove();
		}
	} );

	removedProviderKeys.add( providerKey );
}

export function resetRemovedProviders(): void {
	removedProviderKeys.clear();
}
