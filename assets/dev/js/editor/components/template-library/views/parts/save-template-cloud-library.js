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
					allowClear: true,
					dropdownParent: this.$el,
					width: 'resolve',
					closeOnSelect: false,
					templateResult: this.formatOption.bind(this),
					templateSelection: this.formatSelected.bind(this),
				};

			this.select2Instance = new Select2( {
				$element: $dropdown,
				options: select2Options,
			} );

			$dropdown.val( null ).trigger( 'change' );
		}
	},

	onRender() {
		if ( elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ] ) {
			this.activateSelect2();
		}
	},

	formatOption(option) {
        if ( ! option.id ) {
            return option.text;
        }

        const checkbox = `<input type="checkbox" ${ option.selected ? 'checked' : '' }>`;
        return jQuery( `<span>${checkbox} ${option.text}</span>` );
    },

    formatSelected( option ) {
        return option.text;
    },
} );

module.exports = TemplateLibrarySaveTemplateCloudLibraryView;
