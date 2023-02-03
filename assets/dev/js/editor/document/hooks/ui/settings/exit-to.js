import After from 'elementor-api/modules/hooks/ui/after';

export class ExitTo extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'exit-to';
	}

	getContainerType() {
		return 'editorPreferences_settings';
	}

	getConditions( args ) {
		return undefined !== args.settings.exit_to;
	}

	apply() {
		elementor.getPanelView().getPages( 'menu' ).view.addExitItem();
	}
}

export default ExitTo;
