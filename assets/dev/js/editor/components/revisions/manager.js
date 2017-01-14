var RevisionsCollection = require( './collection' ),
	RevisionsPageView = require( './panel-page' ),
	RevisionsEmptyView = require( './empty-view' ),
	RevisionsManager;

RevisionsManager = function() {
	var self = this,
		revisions;

	var addPanelPage = function() {
		elementor.getPanelView().addPage( 'revisionsPage', {
			getView: function() {
				if ( revisions.length ) {
					return RevisionsPageView;
				}

				return RevisionsEmptyView;
			},
			title: elementor.translate( 'revision_history' ),
			options: {
				collection: revisions
			}
		} );
	};

	var onEditorSaved = function( data ) {
		if ( data.last_revision ) {
			self.addRevision( data.last_revision );
		}

		var revisionsToKeep = revisions.filter( function( revision ) {
			return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
		} );

		revisions.reset( revisionsToKeep );
	};

	var attachEvents = function() {
		elementor.channels.editor.on( 'saved', onEditorSaved );
	};

	var addHotKeys = function() {
		var H_KEY = 72,
			UP_ARROW_KEY = 38,
			DOWN_ARROW_KEY = 40;

		var navigationHandler = {
			isWorthHandling: function() {
				var panel = elementor.getPanelView();

				if ( 'revisionsPage' !== panel.getCurrentPageName() ) {
					return false;
				}

				var revisionsPage = panel.getCurrentPageView();

				return revisionsPage.currentPreviewId && revisionsPage.currentPreviewItem && revisionsPage.children.length > 1;
			},
			handle: function( event ) {
				elementor.getPanelView().getCurrentPageView().navigate( UP_ARROW_KEY === event.which );
			}
		};

		elementor.hotKeys.addHotKeyHandler( UP_ARROW_KEY, 'revisionNavigation', navigationHandler );

		elementor.hotKeys.addHotKeyHandler( DOWN_ARROW_KEY, 'revisionNavigation', navigationHandler );

		elementor.hotKeys.addHotKeyHandler( H_KEY, 'showRevisionsPage', {
			isWorthHandling: function( event ) {
				return elementor.hotKeys.isControlEvent( event ) && event.shiftKey;
			},
			handle: function() {
				elementor.getPanelView().setPage( 'revisionsPage' );
			}
		} );
	};

	this.addRevision = function( revisionData ) {
		revisions.add( revisionData, { at: 0 } );

		var panel = elementor.getPanelView();

		if ( panel.getCurrentPageView() instanceof RevisionsEmptyView ) {
			panel.setPage( 'revisionsPage' );
		}
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
					elementor.getPanelView().setPage( 'revisionsPage' );
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

		elementor.on( 'preview:loaded', addPanelPage );
	};
};

module.exports = new RevisionsManager();
