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

	onBeforeShow() {
		const onShowAction = $e.components.get( 'panel/global' ).getActiveTabConfig().actions.show;

		if ( onShowAction ) {
			elementor.hooks.doAction( onShowAction );
		}
	}

	onBeforeDestroy() {
		const onHideAction = $e.components.get( 'panel/global' ).getActiveTabConfig().actions.hide;

		if ( onHideAction ) {
			elementor.hooks.doAction( onHideAction );
		}
	}

	childViewOptions() {
		const container = this.getOption( 'container' );

		return {
			elementSettingsModel: container.settings,
			container,
		};
	}
}
