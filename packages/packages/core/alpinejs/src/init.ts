import { Alpine } from '@alpinejs/csp';

export function init() {
	// `DOMContentLoaded` only ever fires once per document. If this module loads after that
	// point (e.g. the editor canvas iframe finishes loading before this async chunk executes),
	// the listener below would never run and Alpine would never start.
	if ( document.readyState === 'loading' ) {
		document.addEventListener(
			'DOMContentLoaded',
			() => {
				Alpine.start();
			},
			{ once: true }
		);

		return;
	}

	Alpine.start();
}
