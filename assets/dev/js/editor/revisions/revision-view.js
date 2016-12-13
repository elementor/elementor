module.exports =  Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-revisions-revision-item',

	ui: {
		previewButton: '.elementor-revisions-preview',
		revertButton: '.elementor-revisions-revert'
	},

	events: {
		'click @ui.previewButton': 'onPreviewButtonClick',
		'click @ui.revertButton': 'onRevertButtonClick'
	},

	onPreviewButtonClick: function() {
		var self = this,
			id = this.model.get( 'id' );

		Backbone.$( '.elementor-revisions-revert:visible' ).hide();
		Backbone.$( '.elementor-revisions-preview:not(:visible)' ).show();

		self.ui.previewButton.addClass( 'elementor-button-state' );

		elementor.ajax.send( 'get_revision_preview', {
			data: {
				id: id
			},
			success: function( data ) {
				var collection = elementor.getRegion( 'sections' ).currentView.collection;
				collection.reset();
				collection.set( data );

				self.ui.previewButton.removeClass( 'elementor-button-state' ).hide();
				self.ui.revertButton.show();
			}
		} );
	},

	onRevertButtonClick: function() {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;
		collection.reset();
		collection.set( elementor.config.data );

		this.ui.revertButton.hide();
		this.ui.previewButton.show();
	}
} );
