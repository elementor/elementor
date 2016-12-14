module.exports = function() {
	var self = this;

	self.addPanelPage = function() {

		var revisionsCollection = new Backbone.Collection();

		revisionsCollection.add( elementor.config.revisions );

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
