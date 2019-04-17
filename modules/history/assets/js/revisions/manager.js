var RevisionsCollection = require( './collection' ),
	RevisionsManager;

RevisionsManager = function() {
	const self = this;

	let revisions;

	var onEditorSaved = function( data ) {
		if ( data.latest_revisions ) {
			self.addRevisions( data.latest_revisions );
		}

		self.requestRevisions( () => {
		if ( data.revisions_ids ) {
			var revisionsToKeep = revisions.filter( function( revision ) {
				return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
			} );

			revisions.reset( revisionsToKeep );
		}
		} );
	};

	var attachEvents = function() {
		elementor.channels.editor.on( 'saved', onEditorSaved );
	};

	this.getItems = function() {
		return revisions;
	};

	this.requestRevisions = function( callback ) {
		if ( revisions ) {
			callback( revisions );

			return;
		}

		elementorCommon.ajax.addRequest( 'get_revisions', {
			success: ( data ) => {
				revisions = new RevisionsCollection( data );

				revisions.on( 'update', this.onRevisionsUpdate.bind( this ) );

				callback( revisions );
			},
		} );
	};

	this.setEditorData = function( data ) {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;

		// Don't track in history.
		elementor.history.history.setActive( false );
		collection.reset( data );
		elementor.history.history.setActive( true );
	};

	this.getRevisionDataAsync = function( id, options ) {
		_.extend( options, {
			data: {
				id: id,
			},
		} );

		return elementorCommon.ajax.addRequest( 'get_revision_data', options );
	};

	this.addRevisions = function( items ) {
		this.requestRevisions( () => {
			items.forEach( function( item ) {
				var existedModel = revisions.findWhere( {
					id: item.id,
				} );

				if ( existedModel ) {
					revisions.remove( existedModel, { silent: true } );
				}

				revisions.add( item, { silent: true } );
			} );

			revisions.trigger( 'update' );
		} );
	};

	this.deleteRevision = function( revisionModel, options ) {
		var params = {
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
	};

	this.init = function() {
		attachEvents();

		addCommands();
	};

	this.onRevisionsUpdate = function() {
		if ( elementorCommon.route.is( 'panel/history/revisions' ) ) {
			elementorCommon.route.reload( 'panel/history/revisions' );
		}
	};
};

module.exports = new RevisionsManager();
