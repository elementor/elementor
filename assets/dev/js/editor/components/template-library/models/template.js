module.exports = Backbone.Model.extend( {
	defaults: {
		template_id: 0,
		title: '',
		source: '',
		type: '',
		subtype: '',
		author: '',
		thumbnail: '',
		url: '',
		export_link: '',
		status: null,
		preview_url: null,
		generate_preview_url: null,
		tags: [],
	},

	isLocked() {
		return 'locked' === this.get( 'status' );
	},
} );
