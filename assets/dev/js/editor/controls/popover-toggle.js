import GlobalControlSelect from './behaviors/global-select-behavior';

var ControlChooseView = require( 'elementor-controls/choose' ),
	ControlPopoverStarterView;

ControlPopoverStarterView = ControlChooseView.extend( {
	ui: function() {
		var ui = ControlChooseView.prototype.ui.apply( this, arguments );

		ui.popoverToggle = '.elementor-control-popover-toggle-toggle';

		return ui;
	},

	events: function() {
		return _.extend( ControlChooseView.prototype.events.apply( this, arguments ), {
			'click @ui.popoverToggle': 'onPopoverToggleClick',
		} );
	},

	onPopoverToggleClick: function() {
		this.$el.next( '.elementor-controls-popover' ).toggle();
	},

	behaviors: function() {
		const behaviors = ControlChooseView.prototype.behaviors.apply( this, arguments );

		// We don't want to override existing inherited behaviors, such as dynamic tags
		if ( ! this.options.model.attributes.global ) {
			return behaviors;
		}

		behaviors.globalControlSelect = {
			behaviorClass: GlobalControlSelect,
			popoverContent: this.getGlobalTextStyles(),
			popoverTitle: elementor.translate( 'global_text_styles' ),
			manageButtonText: elementor.translate( 'manage_global_text_styles' ),
			tooltipText: elementor.translate( 'global_typography_info' ),
			newGlobalConfirmTitle: elementor.translate( 'create_global_color' ),
			newGlobalConfirmText: elementor.translate( 'global_typography_confirm_text' ),
		};

		return behaviors;
	},

	// TODO: Replace placeholders with real global colors
	getGlobalTextStyles: function() {
		const $globalTypographyContainer = jQuery( '<div>', { class: 'elementor-global-previews-container' } ),
			globalTextStyles = [
				{
					textStyleName: 'Primary',
					fontFamily: 'Varela',
					fontSize: '34px',
					fontWeight: 'normal',
					transform: 'none',
					fontStyle: 'normal',
					textDecoration: 'none',
					lineHeight: 'inherit',
					letterSpacing: 'inherit',
				},
				{
					textStyleName: 'Secondary',
					fontFamily: 'Varela',
					fontSize: '28px',
					fontWeight: 'normal',
					transform: 'none',
					fontStyle: 'normal',
					textDecoration: 'none',
					lineHeight: 'inherit',
					letterSpacing: 'inherit',
				},
				{
					textStyleName: 'Text',
					fontFamily: 'Varela',
					fontSize: '15px',
					fontWeight: 'normal',
					transform: 'none',
					fontStyle: 'normal',
					textDecoration: 'none',
					lineHeight: 'inherit',
					letterSpacing: 'inherit',
				},
				{
					textStyleName: 'Accent',
					fontFamily: 'Varela',
					fontSize: '12px',
					fontWeight: 'normal',
					transform: 'none',
					fontStyle: 'normal',
					textDecoration: 'none',
					lineHeight: 'inherit',
					letterSpacing: 'inherit',
				},
			];

		globalTextStyles.forEach( ( textStyle ) => {
			const $textStylePreview = jQuery( '<div>', { class: 'elementor-global-preview elementor-global-text-style', 'data-elementor-global-name': textStyle.textStyleName } );

			$textStylePreview
				.html( textStyle.textStyleName )
				.css( {
					fontFamily: textStyle.fontFamily,
					fontSize: textStyle.fontSize,
					fontWeight: textStyle.fontWeight,
					transform: textStyle.transform,
					fontStyle: textStyle.fontStyle,
					textDecoration: textStyle.textDecoration,
					lineHeight: textStyle.lineHeight,
					letterSpacing: textStyle.letterSpacing,
				} );

			$globalTypographyContainer.append( $textStylePreview );
		} );

		return $globalTypographyContainer;
	},
}, {

	onPasteStyle: function( control, clipboardValue ) {
		return ! clipboardValue || clipboardValue === control.return_value;
	},
} );

module.exports = ControlPopoverStarterView;
