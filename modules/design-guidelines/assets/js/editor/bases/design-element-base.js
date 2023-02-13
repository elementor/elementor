export default class DesignElementBase {
	constructor( editorHelper ) {
		this.helper = editorHelper;
		this.selectors = {};


	}

	applyChanges( document, config ) {
		//empty
	}

	getSelector( name ) {
		const selector = this.selectors[ name ];
		return this.getSelectorPrefix() + selector;
	}

	getSelectorPrefix() {
		return ''; // TODO
		// return 'design-guidelines-';
	}
}
