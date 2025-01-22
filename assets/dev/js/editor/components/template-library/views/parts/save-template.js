var TemplateLibrarySaveTemplateView;

import Select2 from 'elementor-editor-utils/select2.js';

TemplateLibrarySaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-save-template',

	template: '#tmpl-elementor-template-library-save-template',

	ui: {
		form: '#elementor-template-library-save-template-form',
		submitButton: '#elementor-template-library-save-template-submit',
		selectDropdown: '#elementor-template-library-save-template-source',
	},

	events: {
		'submit @ui.form': 'onFormSubmit',
	},

	getSaveType() {
		let type;
		if ( this.model ) {
			type = this.model.get( 'elType' );
		} else if ( elementor.config.document.library && elementor.config.document.library.save_as_same_type ) {
			type = elementor.config.document.type;
		} else {
			type = 'page';
		}

		return type;
	},

	templateHelpers() {
		var saveType = this.getSaveType(),
			templateType = elementor.templates.getTemplateTypes( saveType );

		return templateType.saveDialog;
	},

	onFormSubmit( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			saveType = this.getSaveType(),
			JSONParams = { remove: [ 'default' ] };

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.ui.submitButton.addClass( 'elementor-button-state' );

		elementor.templates.saveTemplate( saveType, formData );
	},

	onRender() {
		if ( elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ] ) {
			this.activateSelect2();
		}
	},

	activateSelect2() {
		if ( ! this.select2Instance && this.$( this.ui.selectDropdown ).length ) {
			const $dropdown = this.$( this.ui.selectDropdown ),
				select2Options = {
					placeholder: __( 'Where do you want to save your template?', 'elementor' ),
					dropdownParent: this.$el,
					closeOnSelect: false,
				};

			this.select2Instance = new Select2( {
				$element: $dropdown,
				options: select2Options,
			} );

			this.handlePlaceHolder( $dropdown );
		}
	},

	// https://github.com/select2/select2/issues/3292
	handlePlaceHolder( $dropdown ) {
		const $searchField = $dropdown.siblings( '.select2' ).find( '.select2-search__field' );

		if ( $searchField.length && 0 === $searchField.width() ) {
			$searchField.css( 'width', '100%' );
		}
	},

	onRender() {
		this.activateSelect2();
	},

	addCheckbox( option ) {
		if ( ! option.id ) {
			return option.text;
		}

		const checkbox = `<input type="checkbox" class="middle" ${ option.selected ? 'checked' : '' }>`;

		return jQuery(
			`<label class="cloud-library-option">${ checkbox }
				<span class="middle">${ option.text }</span>
			</label>`,
		);
	},

	formatSelected( option ) {
		return option.text;
	},
} );

module.exports = TemplateLibrarySaveTemplateView;
