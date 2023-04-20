const ControlChooseView = require( 'elementor-controls/choose' );

export default class ControlPopoverStarterView extends ControlChooseView {
	ui() {
		const ui = ControlChooseView.prototype.ui.apply( this, arguments );

		ui.popoverToggle = '.elementor-control-popover-toggle-toggle';
		ui.resetInput = '.elementor-control-popover-toggle-reset';

		return ui;
	}

	events() {
		return _.extend( ControlChooseView.prototype.events.apply( this, arguments ), {
			'click @ui.popoverToggle': 'onPopoverToggleClick',
			'click @ui.resetInput': 'onResetInputClick',
		} );
	}

	onShow() {
		const $popover = this.$el.next( '.elementor-controls-popover' );

		// Attach the current control as a toggle of its popover.
		if ( $popover.length ) {
			$popover[ 0 ].dataset.popoverToggle = `elementor-control-default-${ this.model.cid }`;
		}
	}

	onResetInputClick() {
		const globalData = this.model.get( 'global' );

		if ( globalData?.active ) {
			this.triggerMethod( 'value:type:change' );
		}
	}

	onInputChange( event ) {
		if ( event.currentTarget !== this.ui.popoverToggle[ 0 ] ) {
			return;
		}

		// If the control has a global value, unset the global.
		if ( this.getGlobalKey() ) {
			this.triggerMethod( 'unset:global:value' );
		} else if ( this.isGlobalActive() ) {
			this.triggerMethod( 'value:type:change' );
		}
	}

	onPopoverToggleClick() {
		if ( this.isGlobalActive() && ! this.getControlValue() && ! this.getGlobalKey() && this.getGlobalDefault() ) {
			this.triggerMethod( 'unlink:global:default' );
		}

		const $popover = this.$el.next( '.elementor-controls-popover' );

		$popover.toggle( 0, () => {
			if ( $popover.is( ':visible' ) ) {
				window.dispatchEvent( new CustomEvent( 'elementor/popover/show', {
					detail: {
						el: this.$el,
					},
				} ) );
			}
		} );
	}

	getGlobalCommand() {
		return 'globals/typography';
	}

	buildPreviewItemCSS( globalValue ) {
		const cssObject = {};

		Object.entries( globalValue ).forEach( ( [ property, value ] ) => {
			// If a control value is empty, ignore it.
			if ( ! value || '' === value.size ) {
				return;
			}

			if ( property.startsWith( 'typography_' ) ) {
				property = property.replace( 'typography_', '' );
			}

			if ( 'font_family' === property ) {
				elementor.helpers.enqueueFont( value, 'editor' );
			}

			if ( 'font_size' === property ) {
				// Set max size for Typography previews in the select popover so it isn't too big.
				if ( value.size > 40 ) {
					value.size = 40;
				}
				cssObject.fontSize = value.size + value.unit;
			} else {
				// Convert the snake case property names into camel case to match their corresponding CSS property names.
				if ( property.includes( '_' ) ) {
					property = property.replace( /([_][a-z])/g, ( result ) => result.toUpperCase().replace( '_', '' ) );
				}

				cssObject[ property ] = value;
			}
		} );

		return cssObject;
	}

	createGlobalItemMarkup( globalData ) {
		const $typographyPreview = jQuery( '<div>', { class: 'e-global__preview-item e-global__typography', 'data-global-id': globalData.id } );

		$typographyPreview
			.html( globalData.title )
			.css( this.buildPreviewItemCSS( globalData.value ) );

		return $typographyPreview;
	}

	getGlobalMeta() {
		return {
			commandName: this.getGlobalCommand(),
			key: this.model.get( 'name' ),
			title: __( 'New Typography Setting', 'elementor' ),
			controlType: 'typography',
			route: 'panel/global/global-typography',
		};
	}

	getAddGlobalConfirmMessage() {
		const globalData = this.getGlobalMeta(),
			$message = jQuery( '<div>', { class: 'e-global__confirm-message' } ),
			$messageText = jQuery( '<div>' )
				.html( __( 'Are you sure you want to create a new Global Font setting?', 'elementor' ) ),
			$inputWrapper = jQuery( '<div>', { class: 'e-global__confirm-input-wrapper' } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: globalData.title } )
				.val( globalData.title );

		$inputWrapper.append( $input );

		$message.append( $messageText, $inputWrapper );

		return $message;
	}

	async getGlobalsList() {
		const result = await $e.data.get( this.getGlobalCommand() );

		return result.data;
	}

	buildGlobalsList( globalTypographies, $globalPreviewItemsContainer ) {
		Object.values( globalTypographies ).forEach( ( typography ) => {
			// Only build markup if the typography is valid.
			if ( typography ) {
				const $typographyPreview = this.createGlobalItemMarkup( typography );

				$globalPreviewItemsContainer.append( $typographyPreview );
			}
		} );
	}

	onAddGlobalButtonClick() {
		this.triggerMethod( 'add:global:to:list', this.getAddGlobalConfirmMessage() );
	}
}

ControlPopoverStarterView.onPasteStyle = ( control, clipboardValue ) => {
	return ! clipboardValue || clipboardValue === control.return_value;
};
