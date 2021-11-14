import CommandBase from 'elementor-api/modules/command-base';

export class Select extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], append = false, options = {} } = args;

		elementor.selection.add( containers, append );

		if ( options.scrollIntoView && ! append && 1 === containers.length ) {
			elementor.helpers.scrollToView( containers[ 0 ].view.$el );
		}
	}
}

export default Select;
