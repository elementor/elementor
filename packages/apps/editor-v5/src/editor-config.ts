type EditorV5Config = {
	classicEditorUrl?: string;
};

type ElementorConfigShape = {
	editorV5?: EditorV5Config;
	initial_document?: {
		elements?: unknown[];
		settings?: Record< string, unknown >;
		title?: string;
		widgets?: Record< string, unknown >;
	};
	widgets?: Record< string, unknown >;
};

type ElementorConfigWindow = Window & {
	ElementorConfig?: ElementorConfigShape;
};

export function getElementorConfig(): ElementorConfigShape | undefined {
	return ( window as ElementorConfigWindow ).ElementorConfig;
}

export function getClassicEditorUrl(): string {
	return getElementorConfig()?.editorV5?.classicEditorUrl ?? window.location.href;
}

export function getDocumentTitle(): string {
	return getElementorConfig()?.initial_document?.title ?? 'Editor V5';
}
