var RevisionsCollection = require( './collection' ),
	RevisionsManager;

RevisionsManager = function() {
	var self = this,
		revisions;

	this.getItems = function() {
		return revisions;
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

	this.addRevision = function( revisionData ) {
		revisions.add( revisionData, { at: 0 } );
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
