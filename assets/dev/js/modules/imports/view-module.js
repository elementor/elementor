const ViewModule = elementorModules.BaseModule.extend( {
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

window.elementorModules = elementorModules || {};
window.elementorModules.ViewModule = ViewModule;

export default ViewModule;
