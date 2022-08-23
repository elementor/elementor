module.exports = class Widget {
	constructor( { type, title } ) {
		this.type = type;
		this.title = title;
	}

	getPreviewSelector( id ) {
		return `.elementor-element-${ id }`;
	}
};
