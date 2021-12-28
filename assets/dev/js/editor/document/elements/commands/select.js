import CommandBase from 'elementor-api/modules/command-base';

export class Select extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args,
			{ append = false } = options;

		elementor.selection.add( containers, options );

		if ( options.scrollIntoView && ! append && 1 === containers.length ) {
			$e.internal( 'document/elements/scroll-to-view', { container: containers[ 0 ] } );
		}
	}
}

export default Select;
