module.exports =  Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-revisions-revision-item',

	ui: {
		item: '.elementor-revision-item',
		spinner: '.elementor-state-icon'
	},

	events: {
		'click @ui.item': 'onItemClick'
	},

	onItemClick: function() {
		var self = this,
			id = this.model.get( 'id' );

		Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
		self.ui.item.addClass( 'elementor-state-show' );

		elementor.ajax.send( 'get_revision_preview', {
			data: {
				id: id
			},
			success: function( data ) {
				var collection = elementor.getRegion( 'sections' ).currentView.collection;
				collection.reset();
				collection.set( data );

				self.triggerMethod( 'preview:loaded' );

				self.ui.item.removeClass( 'elementor-state-show' ).addClass( 'elementor-revision-current-preview' );
			},
			error: function( data ) {
				alert( 'An error occurs' );
				self.ui.previewButton.removeClass( 'elementor-state-show' );
			}
		} );
	},
} );
