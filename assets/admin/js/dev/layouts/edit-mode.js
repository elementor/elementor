var EditModeItemView;

EditModeItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-mode-switcher-content',

	id: 'elementor-mode-switcher-inner',

	ui: {
		previewButton: '#elementor-mode-switcher-preview-input',
		previewLabel: '#elementor-mode-switcher-preview',
		previewLabelA11y: '#elementor-mode-switcher-preview .elementor-screen-only'
	},

	events: {
		'change @ui.previewButton': 'onEditModeChange'
	},

	getCurrentMode: function() {
		return this.ui.previewButton.is( ':checked' ) ? 'preview' : 'edit';
	},

	setMode: function( mode ) {
		this.ui.previewButton.prop( 'checked', 'preview' === mode );
	},

	onRender: function() {
		this.onEditModeChange();
	},

	onEditModeChange: function() {
		var oldEditMode = elementor.dataEditMode.request( 'activeMode' ),
			currentMode = this.getCurrentMode();

		elementor.dataEditMode.reply( 'activeMode', currentMode );

		if ( currentMode !== oldEditMode ) {
			elementor.dataEditMode.trigger( 'switch' );

			var title = 'preview' === currentMode ? 'Back to Editor' : 'Preview';

			this.ui.previewLabel.attr( 'title', title );
			this.ui.previewLabelA11y.text( title );
		}
	}
} );

module.exports = EditModeItemView;
