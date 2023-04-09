import environment from 'elementor-common/utils/environment';

var EditModeItemView;

EditModeItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-mode-switcher-content',

	id: 'elementor-mode-switcher-inner',

	ui: {
		previewButton: '#elementor-mode-switcher-preview-input',
		previewLabel: '#elementor-mode-switcher-preview',
		previewLabelIcon: '#elementor-mode-switcher-preview i',
		previewLabelA11yText: '#elementor-mode-switcher-preview .elementor-screen-only',
	},

	events: {
		'change @ui.previewButton': 'onPreviewButtonChange',
		'keyup @ui.previewLabelIcon': 'onPreviewButtonKeyUp',
	},

	initialize() {
		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeChanged );
	},

	getCurrentMode() {
		return this.ui.previewButton.is( ':checked' ) ? 'preview' : 'edit';
	},

	setMode( mode ) {
		this.ui.previewButton
			.prop( 'checked', 'preview' === mode )
			.trigger( 'change' );
	},

	toggleMode() {
		this.setMode( this.ui.previewButton.prop( 'checked' ) ? 'edit' : 'preview' );
	},

	onRender() {
		this.onEditModeChanged();
	},

	onPreviewButtonKeyUp( event ) {
		const ENTER_KEY = 13;

		if ( ENTER_KEY === event.keyCode ) {
			this.toggleMode();
			this.onPreviewButtonChange();
		}
	},

	onPreviewButtonChange() {
		const mode = this.getCurrentMode();

		if ( 'edit' === mode ) {
			$e.run( 'panel/open' );
		} else if ( 'preview' === mode ) {
			$e.run( 'panel/close' );
		} else {
			throw Error( `Invalid mode: '${ mode }'` );
		}
	},

	onEditModeChanged( activeMode ) {
		const ctrlLabel = environment.mac ? '&#8984;' : 'Ctrl';

		let text = 'preview' === activeMode ? __( 'Show Panel', 'elementor' ) : __( 'Hide Panel', 'elementor' );
		text += ` (${ ctrlLabel } + P)`;

		this.ui.previewLabel.attr( 'title', text );
		this.ui.previewLabelA11yText.text( text );
	},
} );

module.exports = EditModeItemView;
