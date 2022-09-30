import environment from 'elementor-common/utils/environment';

export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-hotkeys';
	}

	templateHelpers() {
		return {
			environment,
		};
	}

	getTemplate() {
		return '#tmpl-elementor-hotkeys';
	}
}
