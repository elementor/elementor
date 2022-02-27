import CommandBase from 'elementor-api/modules/command-base';

export class SetTitle extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );

		if ( ! args.title ) {
			throw new Error( 'Title of element cannot be empty.' );
		}
	}

	apply( args ) {
		const { container, title } = args;

		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				_title: title.trim(),
			},
		} );
	}
}

export default SetTitle;
