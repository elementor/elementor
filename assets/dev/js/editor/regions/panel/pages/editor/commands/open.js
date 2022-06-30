export class Open extends $e.modules.CommandBase {
	static getInfo() {
		return {
			isSafe: true,
			isSafeWithArgs: true,
		};
	}

	validateArgs( args = {} ) {
		if ( args.ids ) {
			// Mostly used by `$e.extras.hashCommands`.
			this.requireArgumentType( 'ids', 'string' );

			args.containers = [];

			args.ids.split( ',' ).forEach( ( id ) => {
				const container = elementor.getContainer( id );

				if ( container ) {
					args.containers.push( container );
				}
			} );
		}
	}

	apply( args ) {
		if ( args.ids ) {
			const { containers = [ args.container ] } = args;

			containers.forEach( ( container ) => {
				const newArgs = {
					container,
					model: container.model,
					view: container.view,
				};

				setTimeout( () => $e.run( 'panel/editor/open', newArgs ) );
			} );
		} else {
			this.open( args );
		}
	}

	open( args ) {
		if ( ! this.component.setDefaultTab( args ) ) {
			elementorDevTools.deprecation.deprecated( "model.trigger( 'request:edit' )", '2.9.0', 'editSettings.defaultEditRoute' );

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
			args.view,
		);
	}
}

export default Open;
