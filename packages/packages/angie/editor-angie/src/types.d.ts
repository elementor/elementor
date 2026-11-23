export {};

declare global {
	interface Window {
		elementorEditorAngie?: {
			isAngiePluginActive?: boolean;
			showEntryPoints?: boolean;
			isAngieEnabled?: boolean;
		};
	}
}
