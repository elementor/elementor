import Module from './module';

module.exports = Module.extend( {
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
