export {};

declare global {
	interface Window {
		elementorEditorAngie?: {
			hasConsent?: boolean;
			isAngiePluginActive?: boolean;
			isBlockedBySite?: boolean;
			isExperimentActive?: boolean;
			isPluginInstalled?: boolean;
			isUserDisabled?: boolean;
			showEntryPoints?: boolean;
		};
	}
}
