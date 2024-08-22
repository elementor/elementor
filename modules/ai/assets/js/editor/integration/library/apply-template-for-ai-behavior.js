const { renderLayoutApp, importToEditor } = require( '../../utils/editor-integration' );
const { MODE_VARIATION } = require( '../../pages/form-layout/context/config' );
const { __ } = require( '@wordpress/i18n' );
const { ATTACHMENT_TYPE_JSON, ELEMENTOR_LIBRARY_SOURCE } = require( '../../pages/form-layout/components/attachments' );
var ApplyTemplateForAiBehavior;

ApplyTemplateForAiBehavior = Marionette.Behavior.extend( {
	ui: {
		applyButton: '.elementor-template-library-template-apply-ai',
		generateVariation: '.elementor-template-library-template-generate-variation',
	},

	events: {
		'click @ui.applyButton': 'onApplyButtonClick',
		'click @ui.generateVariation': 'onGenerateVariationClick',
	},

	onGenerateVariationClick() {
		const args = {
			model: this.view.model,
		};

		const libraryComponent = $e.components.get( 'library' );
		const at = libraryComponent.manager.modalConfig?.importOptions?.at;

		libraryComponent.downloadTemplate( args, ( data ) => {
			const model = args.model;

			const attachment = {
				type: ATTACHMENT_TYPE_JSON,
				previewHTML: `<img src="${ model.get( 'thumbnail' ) }" />`,
				content: data.content[ 0 ],
				label: `${ model.get( 'template_id' ) } - ${ model.get( 'title' ) }`,
				source: ELEMENTOR_LIBRARY_SOURCE,
			};

			renderLayoutApp( {
				parentContainer: elementor.getPreviewContainer(),
				mode: MODE_VARIATION,
				at,
				attachments: [ attachment ],
				onInsert: ( template ) => {
					importToEditor( {
						parentContainer: elementor.getPreviewContainer(),
						at,
						template,
						historyTitle: __( 'AI Variation from library', 'elementor' ),
					} );
				},
			} );

			$e.run( 'library/close' );
		} );
	},

	onApplyButtonClick() {
		const args = {
			model: this.view.model,
		};

		this.ui.applyButton.addClass( 'elementor-disabled' );

		if ( 'remote' === args.model.get( 'source' ) && ! elementor.config.library_connect.is_connected ) {
			$e.route( 'library/connect', args );
			return;
		}

		$e.run( 'library/generate-ai-variation', args );
	},
} );

module.exports = ApplyTemplateForAiBehavior;
