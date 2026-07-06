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

function parseDocumentId( value: unknown ): number | null {
	if ( typeof value === 'number' && Number.isFinite( value ) ) {
		return value;
	}

	if ( typeof value === 'string' && value.length > 0 ) {
		const parsed = Number.parseInt( value, 10 );

		return Number.isFinite( parsed ) ? parsed : null;
	}

	return null;
}

type PageSettingsConfig = {
	settings?: Record< string, unknown >;
};

export function getDocumentId(): number | null {
	return parseDocumentId( getConfig()?.initial_document?.id );
}

export function getDocumentSettings(): Record< string, unknown > {
	const pageSettings = getConfig()?.initial_document?.settings;

	if ( ! pageSettings || typeof pageSettings !== 'object' ) {
		return {};
	}

	const nestedSettings = ( pageSettings as PageSettingsConfig ).settings;

	if ( nestedSettings && typeof nestedSettings === 'object' ) {
		return { ...nestedSettings };
	}

	return { ...( pageSettings as Record< string, unknown > ) };
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
