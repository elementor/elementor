export default class AdjustPostType {
	constructor( elements ) {
		this.elements = elements;
	}

	bindEvents() {
		const { templateType } = this.elements;

		templateType.addEventListener( 'change', ( event ) => {
			this.onTemplateTypeChange( event );
		} );
	}

	/*
	 	The 'error-404' is the only option that requires a post type value.
		To ensure that the subtype query param is being passed correctly to the editor when submitting the 'create template' form,
		The post type hidden field should be set with 'not_found404'.
	 */
	onTemplateTypeChange( event ) {
		const { postType } = this.elements;
		const selectedType = event.currentTarget.value;

		postType.value = 'error-404' === selectedType ? 'not_found404' : selectedType;
	}
}
