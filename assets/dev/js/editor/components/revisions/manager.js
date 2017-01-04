var RevisionsCollection = require( './collection' ),
	RevisionsManager;

RevisionsManager = function() {
	var self = this,
		revisions;

	this.addRevision = function( revision ) {
		revisions.add( revision, { at: 0 } );
	};

	this.addPanelPage = function() {
		elementor.getPanelView().addPage( 'revisionsPage', {
			view: require( './revisions-page' ),
			options: {
				collection: revisions
			}
		} );
	};

	this.attachEvents = function() {
		elementor.channels.editor.on( 'saved', self.onEditorSaved );
	};

	this.onEditorSaved = function( data ) {
		if ( data.last_revision ) {
			self.addRevision( data.last_revision );
		}
	};

	this.init = function() {
		revisions = new RevisionsCollection( elementor.config.revisions );

		elementor.on( 'preview:loaded', function() {
			self.addPanelPage();
			self.attachEvents();
		} );
	};
};

module.exports = new RevisionsManager();
