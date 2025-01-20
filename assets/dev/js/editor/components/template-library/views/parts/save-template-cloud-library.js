var TemplateLibrarySaveTemplateCloudLibraryView,
	TemplateLibrarySaveTemplateView = require( 'elementor-templates/views/parts/save-template' );

import Select2 from 'elementor-editor-utils/select2.js';

TemplateLibrarySaveTemplateCloudLibraryView = TemplateLibrarySaveTemplateView.extend( {
	id: 'elementor-template-library-save-template-cloud-library',

	template: '#tmpl-elementor-template-library-save-template-cloud-library',

	ui: {
		form: '#elementor-template-library-save-template-form',
		submitButton: '#elementor-template-library-save-template-submit',
		selectDropdown: '#elementor-template-library-save-template-source',
	},

	activateSelect2() {
		if ( ! this.select2Instance && this.$( this.ui.selectDropdown ).length ) {
			const $dropdown = this.$( this.ui.selectDropdown ),
				select2Options = {
					placeholder: __( 'Where do you want to save your template?', 'elementor' ),
					dropdownParent: this.$el,
					closeOnSelect: false,
					templateResult: this.addCheckbox.bind(this),
					templateSelection: this.formatSelected.bind(this),
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

		if ( $searchField.length && $searchField.width() === 0 ) {
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
			`<label class="cloud-library-option">${checkbox}
				<span class="middle">${option.text}</span>
			</label>`
		);
	},
	
	formatSelected( option ) {
		return option.text;
	},
} );

module.exports = TemplateLibrarySaveTemplateCloudLibraryView;
