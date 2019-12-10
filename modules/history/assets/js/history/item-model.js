module.exports = Backbone.Model.extend( {
	defaults: {
		id: 0,
		type: '',
		status: 'not_applied',
		title: '',
		subTitle: '',
		action: '',
		history: {},
	},

	initialize: function() {
		this.set( 'items', new Backbone.Collection() );
	},
} );
