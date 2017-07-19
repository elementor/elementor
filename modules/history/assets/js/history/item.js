module.exports = Backbone.Model.extend( {
	defaults: {
		id: 0,
		type: '',
		items: new Backbone.Collection(),
		elementType: '',
		status: 'not_applied',
		title: '',
		subTitle: '',
		action: '',
		history: {}
	}
} );
