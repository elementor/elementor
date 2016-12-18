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

	self.init = function() {
		elementor.on( 'preview:loaded', function() {
			self.addPanelPage();
		} );
	};

	self.init();
};
