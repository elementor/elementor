module.exports = Backbone.Model.extend( {
	defaults: {
		template_id: 0,
		title: '',
		source: '',
		type: '',
		author: '',
		thumbnail: '',
		url: '',
		export_link: '',
		tags: []
	}
} );
