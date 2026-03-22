export class Create extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' ),
			container = historyItem.get( 'container' ),
			options = historyItem.get( 'options' ) || {};

		// No clone when restoring. e.g: duplicate will generate unique ids while restoring.
		if ( options.clone ) {
			options.clone = false;
		}

		if ( isRedo ) {
			$e.run( 'document/elements/create', {
				container,
				model: data.modelToRestore,
				options,
			} );
		} else {
			$e.run( 'document/elements/delete', { container: data.containerToRestore } );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );

		// Avoid Backbone model & etc.
		this.requireArgumentConstructor( 'model', Object, args );
	}

	getHistory( args ) {
		const { model, containers = [ args.container ] } = args;

		return {
			containers,
			model,
			type: 'add',
			title: elementor.helpers.getModelLabel( model ),
		};
	}

	apply( args ) {
		const { model, options = {}, containers = [ args.container ] } = args;

		let result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			// Fallback for async-rendered nested elements whose views may not exist yet (ED-22825).
			if ( ! container?.view ) {
				this.addViaModelTree( container, model, options );
				return;
			}

			const createdContainer = container.view.addElement( model, options ).getContainer();

			result.push( createdContainer );

			if ( this.isHistoryActive() && this.history ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-add',
					restore: this.constructor.restore,
					options,
					data: {
						containerToRestore: createdContainer,
						modelToRestore: createdContainer.model.toJSON(),
					},
				} );
			}
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		return result;
	}

	addViaModelTree( container, model, options ) {
		const parentModel = $e.components.get( 'document' ).utils.findModelById( container.id );

		if ( ! parentModel ) {
			return;
		}

		const elements = parentModel.get( 'elements' );

		if ( ! elements ) {
			return;
		}

		elements.add( model, { at: options.at, silent: true } );

		this.rerenderAtomicAncestor( container );
	}

	rerenderAtomicAncestor( container ) {
		let current = container;

		while ( current ) {
			if ( elementor.helpers.isAtomicWidget( current.model ) && current.view ) {
				current.view.invalidateRenderCache?.();
				current.view.render?.();
				return;
			}

			current = current.parent;
		}
	}
}

export default Create;
