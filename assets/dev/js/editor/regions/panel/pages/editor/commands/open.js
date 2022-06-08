export class Open extends $e.modules.CommandBase {
	static getInfo() {
		return {
			isSafe: true,
			isSafeWithArgs: true,
		};
	}

	validateArgs( args = {} ) {
		// Mostly used by `$e.extras.hashCommands`.
		if ( args.id ) {
			this.requireArgumentType( 'id', 'string' );

			args.container = elementor.getContainer( args.id );
			args.model = args.container.model;
			args.view = args.container.view;

			this.requireContainer();
		}
	}

	apply( args ) {
		if ( ! this.component.setDefaultTab( args ) ) {
			elementorCommon.helpers.softDeprecated( "model.trigger( 'request:edit' )", '2.9.0', 'editSettings.defaultEditRoute' );

			args.model.trigger( 'request:edit' );
		} else {
			$e.route( this.component.getDefaultRoute(), args );
		}

		// BC: Run hooks after the route render's the view

		const elementType = args.model.get( 'elType' ),
			widgetType = args.model.get( 'widgetType' );

		// Example: panel/open_editor/widget
		elementor.hooks.doAction( `panel/open_editor/${ elementType }`, this.component.manager, args.model, args.view );

		// Example: panel/open_editor/widget/heading
		elementor.hooks.doAction( `panel/open_editor/${ elementType }/${ widgetType }`,
			this.component.manager,
			args.model,
			args.view
		);
	}
}

export default Open;
