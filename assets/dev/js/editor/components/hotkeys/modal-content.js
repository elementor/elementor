import environment from '../../../utils/environment';

export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-hotkeys';
	}

	templateHelpers() {
		return {
			environment: environment,
		};
	}

	getTemplate() {
		return '#tmpl-elementor-hotkeys';
	}
}
