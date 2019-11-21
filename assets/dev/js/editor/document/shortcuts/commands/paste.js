import Base from '../../commands/base/base';

export class Paste extends Base {
	apply( args ) {
		const { containers = [ args.container ], storageKey = 'clipboard' } = args;

		// If no containers it means that it calls from shortcut and if so, get current element.
		if ( ! containers[ 0 ] ) {
			args.containers = [ elementor.getCurrentElement().getContainer() ];
		}

		// If current container is widget, redirect to parent.
		switch ( args.containers[ 0 ].model.get( 'elType' ) ) {
			case 'section':
				args.options.at = elementor.elements.findIndex( args.containers[ 0 ].model );
			case 'widget':
			case 'column':
				args.containers = [ args.containers[ 0 ].parent ];
			break;
		}

		return $e.run( 'document/elements/paste', args );
	}
}

export default Paste;
