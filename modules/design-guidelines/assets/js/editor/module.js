import EditorHelper from './utils/editorHelper';
import ColorsComponent from './colors/component';
import FontsComponent from './fonts/component';

class Module extends elementorModules.editor.utils.Module {
	activeKitId = 0;

	onInit() {
		const isStyleguidePreviewEnabled = elementor.getPreferences( 'enable_style_guide_preview' );
		const config = window.elementorDesignGuidelinesConfig;

		if ( ! config || ! isStyleguidePreviewEnabled ) {
			return;
		}

		elementor.on( 'preview:loaded', () => {
			this.activeKitId = config.activeKitId;

			if ( elementor.documents.getCurrentId() === this.activeKitId ) {
				return;
			}

			// TODO 21/02/2023 : get active kit id from the server.
			// TODO 21/02/2023 : enqueue styles in iframe somehow.

			this.initModal();
		} );

		elementor.hooks.addAction( 'elementor/preview/style-guide/colors', this.showStyleguidePreview.bind( this ) );
		elementor.hooks.addAction( 'elementor/preview/style-guide/typography', this.showStyleguidePreview.bind( this ) );

		elementor.hooks.addAction( 'elementor/preview/style-guide/hide', this.hideStyleguidePreview.bind( this ) );

		const helper = new EditorHelper();
		$e.components.register( new ColorsComponent( helper, config ) );
		$e.components.register( new FontsComponent( helper, config ) );
	}

	initModal() {
		let modal;

		this.getModal = () => {
			if ( modal ) {
				return modal;
			}

			modal = elementorCommon.dialogsManager.createWidget( 'fillscreen', {
				className: `e-${ this.activeKitId } e-design-guidelines-root`,
				id: 'e-design-guidelines',
				headerMessage: __( 'Style Guide', 'elementor-pro' ),
				message: __( 'Content has to be inserted here.', 'elementor-pro' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				hide: {
					onOutsideClick: false,
					onEscKeyPress: false,
					onClick: false,
					onBackgroundClick: false,
				},
				container: elementor.$previewContents.find( 'body' ),
			} );

			return modal;
		};
	}

	showStyleguidePreview() {
		this.getModal().show();
	}

	hideStyleguidePreview() {
		this.getModal().hide();
	}
}

new Module();
