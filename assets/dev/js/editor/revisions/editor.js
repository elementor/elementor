module.exports = function() {
	var self = this;

	self.addPanelPage = function() {

		var revisionsCollection = new Backbone.Collection();

		_.each( elementor.config.revisions, function( revision ) {
			var revisionModel = new Backbone.Model( {
				id: revision.id,
				date: revision.date
			} );

			revisionsCollection.add( revisionModel );
		} );

		elementor.getPanelView().addPage( 'revisionsPage', {
			view: require( './revisions-page' ),
			options: {
				collection: revisionsCollection
			}
		} );
	};

	self.init = function() {
		elementor.on( 'preview:loaded', function() {
			self.addPanelPage();
		} );
	};

	self.init();
};
