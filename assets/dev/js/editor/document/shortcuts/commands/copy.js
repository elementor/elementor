import Base from '../../commands/base/base';

export class Copy extends Base {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		// If no containers it means that it calls from shortcut and if so, get current element.
		if ( ! containers[ 0 ] ) {
			args.containers = [ elementor.getCurrentElement().getContainer() ];
		}

		return $e.run( 'document/elements/copy', args );
	}
}

export default Copy;
