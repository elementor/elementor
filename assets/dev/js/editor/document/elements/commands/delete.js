export class Delete extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		const container = historyItem.get( 'container' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'document/elements/delete', { container } );
		} else {
			$e.run( 'document/elements/create', {
				container: data.parent,
				model: data.model,
				options: {
					at: data.at,
				},
			} );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'remove',
		};
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			// Fallback for async-rendered nested elements whose views may not exist yet (ED-22825).
			if ( ! container?.view || container.view.isDestroyed ) {
				const fresh = $e.components.get( 'document' ).utils.findContainerById( container.id );
				this.deleteViaModelTree( fresh );
				return;
			}

			if ( this.isHistoryActive() && this.history ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-remove',
					restore: this.constructor.restore,
					data: {
						model: container.model.toJSON(),
						parent: container.parent,
						at: container.view._index,
					},
				} );
			}

			this.dispatchDeleteEvent( container, args.callerName );
			this.deselectRecursive( container.model.get( 'id' ) );

			container.model.destroy();
			container.panel.refresh();
		} );

		if ( 1 === containers.length ) {
			return containers[ 0 ];
		}

		return containers;
	}

	deleteViaModelTree( container ) {
		if ( ! container?.parent ) {
			return;
		}

		const parentModel = $e.components.get( 'document' ).utils.findModelById( container.parent.id );

		if ( ! parentModel ) {
			return;
		}

		const elements = parentModel.get( 'elements' );

		if ( ! elements ) {
			return;
		}

		const child = elements.findWhere( { id: container.id } );

		if ( ! child ) {
			return;
		}

		elements.remove( child, { silent: true } );
	}

	dispatchDeleteEvent( container, callerName ) {
		try {
			if ( ! elementorCommon?.eventsManager?.dispatchEvent ) {
				return;
			}

			const elType = container.model.get( 'elType' ) ?? '';
			const widgetType = container.model.get( 'widgetType' ) ?? '';
			const widgetName = 'widget' === elType ? widgetType : elType;
			const parentWidgetType = container.parent?.model?.get( 'widgetType' ) ?? '';
			const parentType = parentWidgetType || container.parent?.type || '';

			const eventData = {
				app_type: 'editor',
				window_name: 'editor',
				interaction_type: 'click',
				target_type: elType,
				target_name: 'delete',
				interaction_result: `${ elType }_deleted`,
				target_location: 'canvas',
				location_l1: parentType,
				location_l2: widgetName,
				interaction_description: `user_deleted_${ widgetName }_from_canvas`,
			};

			if ( callerName ) {
				eventData.trigger = callerName;
			}

			elementorCommon.eventsManager.dispatchEvent( 'delete_element', eventData );
		} catch {
			// Silently fail — analytics should never break production functionality.
		}
	}

	deselectRecursive( id ) {
		const container = elementor.getContainer( id );

		if ( elementor.selection.has( container ) ) {
			$e.run( 'document/elements/deselect', { container } );
		}

		container?.model.get( 'elements' ).forEach( ( childModel ) => {
			this.deselectRecursive( childModel.get( 'id' ) );
		} );
	}
}

export default Delete;
