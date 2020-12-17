import RepeaterRow from '../../../../assets/dev/js/editor/controls/repeater-row';

export default class extends RepeaterRow {
	getTemplate() {
		return '#tmpl-elementor-global-style-repeater-row';
	}

	events() {
		return {
			'click @ui.removeButton': 'onRemoveButtonClick',
		};
	}

	updateColorValue() {
		this.$colorValue.text( this.model.get( 'color' ) );
	}

	getDisabledRemoveButtons() {
		if ( ! this.ui.disabledRemoveButtons ) {
			this.ui.disabledRemoveButtons = this.$el.find( '.elementor-repeater-tool-remove--disabled' );
		}

		return this.ui.disabledRemoveButtons;
	}

	getRemoveButton() {
		return this.ui.removeButton.add( this.getDisabledRemoveButtons() );
	}

	triggers() {
		return {};
	}

	onChildviewRender( childView ) {
		const isColor = 'color' === childView.model.get( 'type' ),
			isPopoverToggle = 'popover_toggle' === childView.model.get( 'type' );

		let globalType = '',
			globalTypeTranslated = '';

		if ( isColor ) {
			this.$colorValue = jQuery( '<div>', { class: 'e-global-colors__color-value elementor-control-unit-3' } );

			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.prepend( this.getRemoveButton(), this.$colorValue );

			globalType = 'color';
			globalTypeTranslated = __( 'Color', 'elementor' );

			this.updateColorValue();
		}

		if ( isPopoverToggle ) {
			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.append( this.getRemoveButton() );

			globalType = 'font';
			globalTypeTranslated = __( 'Font', 'elementor' );
		}

		if ( isColor || isPopoverToggle ) {
			const removeButtons = this.getDisabledRemoveButtons();

			this.ui.removeButton.data( 'e-global-type', globalType );

			this.ui.removeButton.tipsy( {
				/* translators: %s: Font/Color. */
				title: () => sprintf( __( 'Delete Global %s', 'elementor' ), globalTypeTranslated ),
				gravity: () => 's',
			} );

			removeButtons.tipsy( {
				/* translators: %s: Font/Color. */
				title: () => sprintf( __( 'System %s can\'t be deleted', 'elementor' ), globalTypeTranslated ),
				gravity: () => 's',
			} );
		}
	}

	onModelChange( model ) {
		if ( undefined !== model.changed.color ) {
			this.updateColorValue();
		}
	}

	onRemoveButtonClick() {
		const globalType = this.ui.removeButton.data( 'e-global-type' ),
			globalTypeTranslatedCapitalized = 'font' === globalType ? __( 'Font', 'elementor' ) : __( 'Color', 'elementor' ),
			globalTypeTranslatedLowercase = 'font' === globalType ? __( 'font', 'elementor' ) : __( 'color', 'elementor' ),
			/* translators: First %s: Font/Color. Second %s: typography/color */
			translatedMessage = sprintf( __( 'You\'re about to delete a Global %s. Note that if it\'s being used anywhere on your site, it will inherit a default %s.', 'elementor' ), globalTypeTranslatedCapitalized, globalTypeTranslatedLowercase );

		this.confirmDeleteModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'e-global__confirm-delete',
			/* translators: %s: Font/Color. */
			headerMessage: sprintf( __( 'Delete Global %s', 'elementor' ), globalTypeTranslatedCapitalized ),
			message: '<i class="eicon-info-circle"></i> ' + translatedMessage,
			strings: {
				confirm: __( 'Delete', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			hide: {
				onBackgroundClick: false,
			},
			onConfirm: () => {
				this.trigger( 'click:remove' );
			},
		} );

		this.confirmDeleteModal.show();
	}
}
