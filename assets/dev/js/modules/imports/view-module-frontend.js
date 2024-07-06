import Module from './module-frontend';

export default Module.extend( {
	elements: null,

	getDefaultElements() {
		return {};
	},

	bindEvents() {},

	onInit() {
		if ( 'function' !== typeof this.getDefaultElements ) {
			return;
		}

		this.initElements();
		this.bindEvents();
	},

	initElements() {
		this.elements = this.getDefaultElements();
	},
} );
