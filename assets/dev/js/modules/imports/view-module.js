import Module from './module';

export default Module.extend( {
	elements: null,

	getDefaultElements() {
		return {};
	},

	bindEvents() {},

	onInit() {
		if( 'function' === typeof this.getDefaultElements ) {
			console.log( 'not default elements' );
			this.initElements();
			this.bindEvents();
		} else {
			console.log( 'default elements' );
		}


	},

	initElements() {
		if( 'function' === typeof this.getDefaultElements ) {
		this.elements = this.getDefaultElements();
		}
	},
} );
