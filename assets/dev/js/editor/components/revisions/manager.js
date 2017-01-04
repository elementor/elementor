var RevisionsManager;

RevisionsManager = function() {
	var self = this;

	self.addPanelPage = function() {
		elementor.getPanelView().addPage( 'revisionsPage', {
			view: require( './revisions-page' )
		} );
	};

	self.attachEvents = function() {
		elementor.channels.editor.on( 'saved', self.onEditorSaved );
	};

	self.onEditorSaved = function( data ) {
		if ( data.last_revision ) {
			elementor.getPanelView().getPages( 'revisionsPage' ).addRevisionToList( data.last_revision );
		}
	};

	self.init = function() {
		elementor.on( 'preview:loaded', function() {
			self.addPanelPage();
			self.attachEvents();
		} );
	};
};

module.exports = new RevisionsManager();
