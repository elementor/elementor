module.exports = class Widget {
	constructor( { type } ) {
		this.type = type;
	}

	getPreviewSelector( id ) {
		return `.elementor-element-${ id }`;
	}
};
