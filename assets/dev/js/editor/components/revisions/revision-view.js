module.exports =  Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-revisions-revision-item',

	className: 'elementor-revision-item',

	ui: {
		deleteButton: '.elementor-revision-item__tools-delete'
	},

	triggers: {
		'click': 'click',
		'click @ui.deleteButton': 'delete:click'
	}
} );
