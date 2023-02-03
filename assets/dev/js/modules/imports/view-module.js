import Module from './module';

export default Module.extend( {
	elements: null,

	getDefaultElements() {
		return {};
	},

	bindEvents() {},

	onInit() {
		this.initElements();

		this.bindEvents();
	},

	initElements() {
		this.elements = this.getDefaultElements();
	},
} );
