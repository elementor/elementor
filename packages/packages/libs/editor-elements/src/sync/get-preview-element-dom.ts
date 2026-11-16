import { getContainer } from './get-container';

type ExtendedWindow = Window & {
	elementor?: {
		getPreviewContainer?: () => { view?: { el?: HTMLElement } } | undefined;
	};
};

export function getPreviewElementDOM( id: string ): HTMLElement | null {
	try {
		const fromContainer = getContainer( id )?.view?.el;

		if ( fromContainer ) {
			return fromContainer;
		}

		return queryPreviewDOMByElementId( id );
	} catch {
		return null;
	}
}

function queryPreviewDOMByElementId( id: string ): HTMLElement | null {
	const previewDocument = ( window as unknown as ExtendedWindow ).elementor?.getPreviewContainer?.()?.view?.el
		?.ownerDocument;

	if ( ! previewDocument ) {
		return null;
	}

	return previewDocument.querySelector< HTMLElement >( `[data-id="${ id }"]` );
}
