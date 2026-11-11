import { waitForEditorTourReady } from './editor-readiness';
import { GuidedTours } from './tours-manager';

export { GuidedTours };

const bootstrapGuidedTours = () => {
	const config = window.elementorGuidedToursConfig;

	if ( ! config ) {
		return;
	}

	const guidedTours = new GuidedTours( config );
	guidedTours.init();

	// Intentionally global for manual QA and future in-editor integrations; not a stable public API.
	window.elementorGuidedTours = guidedTours;
};

if ( 'editor' === window.elementorGuidedToursConfig?.context ) {
	waitForEditorTourReady( bootstrapGuidedTours );
} else {
	bootstrapGuidedTours();
}
