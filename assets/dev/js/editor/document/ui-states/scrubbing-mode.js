// TODO: Move the `editor` component when it's available, because it's not a document related state.

import UiStateBase from 'elementor-api/core/states/ui-state-base';

export class ScrubbingMode extends UiStateBase {
	static ON = 'on';

	getId() {
		return 'scrubbing-mode';
	}

	getOptions() {
		// When scrubbing mode is on, body gets class 'e-ui-state--document-scrubbing-mode__on'
		return {
			[ this.constructor.ON ]: '',
		};
	}

	getScopes() {
		return [
			window.document.body,
		];
	}
}
