import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
	apply( args ) {
		if ( ! this.component.setDefaultTab( args ) ) {
			elementorCommon.helpers.softDeprecated( "model.trigger( 'request:edit' )", '2.9.0', 'editSettings.defaultEditRoute' );

			args.model.trigger( 'request:edit' );
		} else {
			$e.route( this.component.getDefaultRoute(), args );
		}

		// BC: Run hooks after the route render's the view.
		const action = 'panel/open_editor/' + args.model.get( 'elType' );

		// Example: panel/open_editor/widget
		elementor.hooks.doAction( action, this.component.manager, args.model, args.view );

		// Example: panel/open_editor/widget/heading
		elementor.hooks.doAction( action + '/' + args.model.get( 'widgetType' ),
			this.component.manager,
			args.model,
			args.view
		);
	}
}

export default Open;
