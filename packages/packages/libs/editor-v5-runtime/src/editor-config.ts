import type { ElementNode } from '@elementor/editor-v5-store';

import { normalizeLoadedElements, serializeElementsForSave } from './serialize';

type ElementorConfigShape = {
	initial_document?: {
		elements?: unknown[];
		id?: number;
		settings?: Record< string, unknown >;
		title?: string;
	};
};

type ElementorConfigWindow = Window & {
	ElementorConfig?: ElementorConfigShape;
};

function getConfig(): ElementorConfigShape | undefined {
	return ( window as ElementorConfigWindow ).ElementorConfig;
}

export function getDocumentId(): number | null {
	const documentId = getConfig()?.initial_document?.id;

	return typeof documentId === 'number' ? documentId : null;
}

export function getDocumentSettings(): Record< string, unknown > {
	const settings = getConfig()?.initial_document?.settings ?? {};

	return { ...settings };
}

export function getInitialElements(): ElementNode[] {
	const elements = getConfig()?.initial_document?.elements ?? [];

	return normalizeLoadedElements( elements );
}

export function syncElementsToEditorConfig( elements: ElementNode[] ): void {
	const config = getConfig();

	if ( ! config?.initial_document ) {
		return;
	}

	config.initial_document.elements = serializeElementsForSave( elements );
}
