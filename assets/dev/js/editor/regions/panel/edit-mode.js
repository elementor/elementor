var EditModeItemView;

EditModeItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-mode-switcher-content',

	id: 'elementor-mode-switcher-inner',

	ui: {
		previewButton: '#elementor-mode-switcher-preview-input',
		previewLabel: '#elementor-mode-switcher-preview',
		previewLabelA11y: '#elementor-mode-switcher-preview .elementor-screen-only',
	},

	events: {
		'change @ui.previewButton': 'onPreviewButtonChange',
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
		const title = 'preview' === activeMode ? __( 'Back to Editor', 'elementor' ) : __( 'Preview', 'elementor' );

		this.ui.previewLabel.attr( 'title', title );
		this.ui.previewLabelA11y.text( title );
	},
} );

module.exports = EditModeItemView;
