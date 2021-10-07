import CommandHistory from 'elementor-document/commands/base/command-history';

export class Duplicate extends CommandHistory {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'duplicate',
		};
	}

	apply( args ) {
		const { containers = [ args.container ] } = args,
			result = [];
		let at = containers[ containers.length - 1 ].view._index;

		if ( ! elementor.selection.isSameType() ) {
			elementor.notifications.showToast( {
				message: __( 'That didn’t work. Try duplicating one kind of element at a time.', 'elementor' ),
				buttons: [
					{
						name: 'got_it',
						text: __( 'Got it', 'elementor' ),
					},
				],
			} );

			return false;
		}

		containers.forEach( ( container ) => {
			const parent = container.parent;

			result.push( $e.run( 'document/elements/create', {
				container: parent,
				model: container.model.toJSON(),
				options: {
					at: ++at,
					clone: true,
				},
			} ) );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Duplicate;
