module.exports =  Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-revisions-revision-item',

	ui: {
		item: '.elementor-revision-item',
		deleteButton: '.elementor-revision-delete',
		spinner: '.elementor-state-icon'
	},

	triggers: {
		'click @ui.item': 'item:click',
		'click @ui.deleteButton': 'delete:click'
	}
} );
