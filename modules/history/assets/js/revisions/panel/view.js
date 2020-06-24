module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-revisions-revision-item',

	className: 'elementor-revision-item',

	ui: {
		detailsArea: '.elementor-revision-item__details',
	},

	triggers: {
		'click @ui.detailsArea': 'detailsArea:click',
	},
} );
