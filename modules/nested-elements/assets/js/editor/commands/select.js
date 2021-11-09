import CommandHistory from 'elementor-document/commands/base/command-history';

export class Select extends CommandHistory {
	static restore( historyItem, isRedo ) {
		const container = historyItem.get( 'container' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'nested-elements/select', {
				container,
				index: data.current,
			} );
		} else {
            $e.run( 'nested-elements/select', {
				container,
                index: data.prev || 1,
            } );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );
		this.requireArgumentType( 'index', 'number', args );

		const { containers = [ args.container ] } = args;

		// When there multiple containers, then its not supported.
		if ( containers.length > 1 ) {
			throw new Error( 'Multiple containers are not supported.' );
		}
	}

	getHistory( args ) {
		const { container, index } = args,
			editSettings = container.model.get( 'editSettings' );

		return {
			container,
			type: 'selected',
			subTitle: __( 'Item #', 'elementor' ) + index,
			restore: this.constructor.restore,
			data: {
				current: index,
				prev: editSettings.get( 'activeItemIndex' ),
			},
		};
	}

	/**
	 * @inheritDoc
	 *
	 * @param {Container} container
	 * @param {number} index
	 */
	apply( { container, index } ) {
		const editSettings = container.model.get( 'editSettings' );

		editSettings.set( 'activeItemIndex', index );
	}
}
export default Select;
