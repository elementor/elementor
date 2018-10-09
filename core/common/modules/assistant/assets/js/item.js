export default class extends Marionette.ItemView {
	className() {
		return 'elementor-assistant__results__item';
	}

	getTemplate() {
		return '#tmpl-elementor-assistant__results__item';
	}

	tagName() {
		if ( this.model.get( 'link' ) ) {
			return 'a';
		}

		return 'div';
	}

	attributes() {
		const attributes = {},
			link = this.model.get( 'link' );

		if ( link ) {
			attributes.href = link;
			attributes.target = '_blank';
		}

		return attributes;
	}
}
