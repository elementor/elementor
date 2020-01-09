const RevisionsCollection = require( './collection' );

/**
 * TODO: consider refactor this class.
 */
export default class RevisionsManager {
	history;
	revisions;

	constructor( document ) {
		this.attachEvents();

		this.history = document.history;
	}

	onEditorSaved( data ) {
		if ( data.latest_revisions ) {
			this.addRevisions( data.latest_revisions );
		}

		this.requestRevisions( () => {
			if ( data.revisions_ids ) {
				const revisionsToKeep = this.revisions.filter( ( revision ) => {
					return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
				} );

				this.revisions.reset( revisionsToKeep );
			}
		} );
	}

	attachEvents() {
		elementor.channels.editor.on( 'saved', this.onEditorSaved.bind( this ) );
	}

	getItems() {
		return this.revisions;
	}

	requestRevisions( callback ) {
		if ( this.revisions ) {
			callback( this.revisions );

			return;
		}

		elementorCommon.ajax.addRequest( 'get_revisions', {
			success: ( data ) => {
				this.revisions = new RevisionsCollection( data );

				this.revisions.on( 'update', this.onRevisionsUpdate.bind( this ) );

				callback( this.revisions );
			},
		} );
	}

	setEditorData( data ) {
		const collection = elementor.getRegion( 'sections' ).currentView.collection;

		// Don't track in history.
		this.history.setActive( false );

		collection.reset( data );

		this.history.setActive( true );
	}

	getRevisionDataAsync( id, options ) {
		_.extend( options, {
			data: {
				id: id,
			},
		} );

		return elementorCommon.ajax.addRequest( 'get_revision_data', options );
	}

	addRevisions( items ) {
		this.requestRevisions( () => {
			items.forEach( ( item ) => {
				const existedModel = this.revisions.findWhere( {
					id: item.id,
				} );

				if ( existedModel ) {
					this.revisions.remove( existedModel, { silent: true } );
				}

				this.revisions.add( item, { silent: true } );
			} );

			this.revisions.trigger( 'update' );
		} );
	}

	deleteRevision( revisionModel, options ) {
		const params = {
			data: {
				id: revisionModel.get( 'id' ),
			},
			success: () => {
				if ( options.success ) {
					options.success();
				}

				revisionModel.destroy();
			},
		};

		if ( options.error ) {
			params.error = options.error;
		}

		elementorCommon.ajax.addRequest( 'delete_revision', params );
	}

	onRevisionsUpdate() {
		if ( $e.routes.is( 'panel/history/revisions' ) ) {
			$e.routes.refreshContainer( 'panel' );
		}
	}
}
