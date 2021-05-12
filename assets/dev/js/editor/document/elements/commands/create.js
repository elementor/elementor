import CommandHistory from 'elementor-document/commands/base/command-history';
import Helper from 'elementor-document/hooks/data/document/elements/helper';

export class Create extends CommandHistory {
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

		// BC: Deprecated since 2.8.0 - use `$e.hooks`.
		if ( ! options.trigger ) {
			options.trigger = {
				beforeAdd: 'element:before:add',
				afterAdd: 'element:after:add',
			};
		}

		containers.forEach( ( container ) => {
			container = container.lookup();

			const isContainerElement = ( 'container' === container.model.get( 'elType' ) ),
				position = options.at;

			// Ignore the insert position if the parent is a container element.
			if ( isContainerElement ) {
				delete options.at;
			}

			const createdContainer = container.view.addElement( model, options ).getContainer();

			// Set the element's position if it's inside a container element.
			if ( isContainerElement ) {
				Helper.reOrderFlexItems( createdContainer, position );
			}

			result.push( createdContainer );

			/**
			 * Acknowledge history of each created item, because we cannot pass the elements when they do not exist
			 * in getHistory().
			 */
			if ( this.isHistoryActive() ) {
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

	isDataChanged() {
		return true;
	}
}

export default Create;
