module.exports = function() {
	var self = this;

	self.addPanelPage = function() {
		elementor.getPanelView().addPage( 'revisionsPage', {
			view: require( './revisions-page' ),
			options: {
				collection: new Backbone.Collection( elementor.config.revisions )
			}
		} );
	};

	self.attachEvents = function() {
		elementor.channels.editor.on( 'editor:saved', self.onEditorSaved );
	};

	self.onEditorSaved = function( data ) {
		if ( data.last_revision ) {
			elementor.getPanelView().getPages( 'revisionsPage' ).options.collection.add( data.last_revision, { at: 0 } );
		}
	};

	self.init = function() {
		elementor.on( 'preview:loaded', function() {
			self.addPanelPage();
			self.attachEvents();
		} );
	};

	self.init();
};
