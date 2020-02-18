export default class extends elementorModules.editor.views.ControlsStack {
	id() {
		return 'elementor-kit-panel-content';
	}

	getTemplate() {
		return '#tmpl-elementor-kit-panel-content';
	}

	childViewContainer() {
		return '#elementor-kit-panel-content-controls';
	}

	childViewOptions() {
		const container = this.getOption( 'container' );

		return {
			elementSettingsModel: container.settings,
			container,
		};
	}
}
