module.exports =  Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-revisions-revision-item',

	className: 'elementor-revision-item',

	ui: {
		deleteButton: '.elementor-revision-delete',
		spinner: '.elementor-state-icon'
	},

	triggers: {
		'click': 'click',
		'click @ui.deleteButton': 'delete:click'
	}
} );
