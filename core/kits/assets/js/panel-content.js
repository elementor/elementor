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
		const tabConfig = $e.components.get( 'panel/global' ).getActiveTabConfig();

		elementor.hooks.doAction( `panel/${ tabConfig.group }/tab/before-show`, { id: tabConfig.id } );
	}

	onBeforeDestroy() {
		const tabConfig = $e.components.get( 'panel/global' ).getActiveTabConfig();

		elementor.hooks.doAction( `panel/${ tabConfig.group }/tab/before-destroy`, { id: tabConfig.id } );
	}

	childViewOptions() {
		const container = this.getOption( 'container' );

		return {
			elementSettingsModel: container.settings,
			container,
		};
	}
}
