export class Remove extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' ),
			container = historyItem.get( 'container' );

		if ( isRedo ) {
			$e.run( 'document/repeater/remove', {
				container,
				name: data.name,
				index: data.index,
			} );
		} else {
			$e.run( 'document/repeater/insert', {
				container,
				model: data.model,
				name: data.name,
				options: { at: data.index },
			} );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'name', 'string', args );
		this.requireArgument( 'index', args ); // Sometimes null.
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'remove',
			subTitle: __( 'Item', 'elementor' ),
		};
	}

	apply( args ) {
		const { name, containers = [ args.container ] } = args,
			index = null === args.index ? -1 : args.index,
			result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			const collection = container.settings.get( name ),
				model = collection.at( index ),
				repeaterContainer = container.repeaters[ name ];

			if ( this.isHistoryActive() ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					data: { name, model, index },
					restore: this.constructor.restore,
				} );
			}

			// Remove from container and add to result.
			result.push( repeaterContainer.children.splice( index, 1 ) );



			if ( 'Accordion' === container.label ) {
				collection.remove( model );
				const widgetContainer = container.document.$element[ 0 ];
				const targetElement = widgetContainer.querySelectorAll( '.e-n-accordion-item' );
				targetElement[ index ].remove();
			} else {
				// Trigger render on widget but with the settings of the control.
				repeaterContainer.render();
			}
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Remove;
