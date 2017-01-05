var RevisionsCollection = require( './collection' ),
	RevisionsPageView = require( './revisions-page' ),
	RevisionsEmptyView = require( './no-revisions-view' ),
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
			options: {
				collection: revisions
			}
		} );
	};

	var onEditorSaved = function( data ) {
		if ( data.last_revision ) {
			self.addRevision( data.last_revision );
		}
	};

	var attachEvents = function() {
		elementor.channels.editor.on( 'saved', onEditorSaved );
	};

	this.addRevision = function( revisionData ) {
		revisions.add( revisionData, { at: 0 } );

		var revisionsToKeepNum = elementor.config.revisions_to_keep;

		if ( -1 !== revisionsToKeepNum && revisions.length > revisionsToKeepNum ) {
			var revisionsToKeep = revisions.slice( 0, revisionsToKeepNum ),
				autoSaveRevision = revisions.findWhere( { type: 'autosave' } ),
				autoSaveRevisionIndex = revisions.indexOf( autoSaveRevision );

			if ( autoSaveRevisionIndex >= revisionsToKeepNum  ) {
				revisionsToKeep.push( autoSaveRevision );
			}

			revisions.reset( revisionsToKeep );
		}

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

		elementor.on( 'preview:loaded', function() {
			addPanelPage();

			attachEvents();
		} );
	};
};

module.exports = new RevisionsManager();
