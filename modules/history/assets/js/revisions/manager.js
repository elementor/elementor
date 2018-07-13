var RevisionsCollection = require( './collection' ),
	RevisionsManager;

RevisionsManager = function() {
	var self = this,
		revisions;

	this.getItems = function() {
		return revisions;
	};

	var onEditorSaved = function( data ) {
		if ( data.latest_revisions ) {
			self.addRevisions( data.latest_revisions );
		}

		if ( data.revisions_ids ) {
			var revisionsToKeep = revisions.filter( function( revision ) {
				return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
			} );

			revisions.reset( revisionsToKeep );
		}
	};

	var attachEvents = function() {
		elementor.channels.editor.on( 'saved', onEditorSaved );
	};

	var addHotKeys = function() {
		var UP_ARROW_KEY = 38,
			DOWN_ARROW_KEY = 40;

		var navigationHandler = {
			isWorthHandling: function() {
				var panel = elementor.getPanelView();

				if ( 'historyPage' !== panel.getCurrentPageName() ) {
					return false;
				}

				var revisionsTab = panel.getCurrentPageView().getCurrentTab();

				return revisionsTab.currentPreviewId && revisionsTab.currentPreviewItem && revisionsTab.children.length > 1;
			},
			handle: function( event ) {
				elementor.getPanelView().getCurrentPageView().getCurrentTab().navigate( UP_ARROW_KEY === event.which );
			}
		};

		elementor.hotKeys.addHotKeyHandler( UP_ARROW_KEY, 'revisionNavigation', navigationHandler );

		elementor.hotKeys.addHotKeyHandler( DOWN_ARROW_KEY, 'revisionNavigation', navigationHandler );
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
				id: id
			}
		} );

		return elementor.ajax.send( 'get_revision_data', options );
	};

	this.addRevisions = function( items ) {
		items.forEach( function( item ) {
			var existedModel = revisions.findWhere( {
				id: item.id
			} );

			if ( existedModel ) {
				revisions.remove( existedModel );
			}

			revisions.add( item );
		} );
	};

	this.deleteRevision = function( revisionModel, options ) {
		var params = {
			data: {
				id: revisionModel.get( 'id' )
			},
			success: function() {
				if ( options.success ) {
					options.success();
				}

				revisionModel.destroy();

				if ( ! revisions.length ) {
					var panel = elementor.getPanelView();
					if ( 'historyPage' === panel.getCurrentPageName() ) {
						panel.getCurrentPageView().activateTab( 'revisions' );
					}
				}
			}
		};

		if ( options.error ) {
			params.error = options.error;
		}

		elementor.ajax.send( 'delete_revision', params );
	};

	this.init = function() {
		revisions = new RevisionsCollection( elementor.config.revisions );

		attachEvents();

		addHotKeys();
	};
};

module.exports = new RevisionsManager();
