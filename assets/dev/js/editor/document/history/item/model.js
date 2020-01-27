export default class Model extends Backbone.Model {
	defaults() {
		return {
			id: 0,
			type: '',
			status: 'not_applied',
			title: '',
			subTitle: '',
			action: '',
			history: {},
		};
	}

	initialize( attributes, options ) {
		this.set( 'items', new Backbone.Collection() );
	}
}
