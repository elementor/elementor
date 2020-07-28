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

		let globalType = '';

		if ( isColor ) {
			this.$colorValue = jQuery( '<div>', { class: 'e-global-colors__color-value' } );

			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.prepend( this.getRemoveButton(), this.$colorValue );

			globalType = 'color';

			this.updateColorValue();
		}

		if ( isPopoverToggle ) {
			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.append( this.getRemoveButton() );

			globalType = 'font';
		}

		if ( isColor || isPopoverToggle ) {
			const removeButtons = this.getDisabledRemoveButtons();

			this.ui.removeButton.data( 'e-global-type', globalType );

			this.ui.removeButton.tipsy( {
				title: () => elementor.translate( 'delete_global_' + globalType ),
				gravity: () => 's',
			} );

			removeButtons.tipsy( {
				title: () => elementor.translate( globalType + '_cannot_be_deleted' ),
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
		const globalType = this.ui.removeButton.data( 'e-global-type' );

		this.confirmDeleteModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'e-global__confirm-delete',
			headerMessage: elementor.translate( 'delete_global_' + globalType ),
			message: '<i class="eicon-info-circle"></i> ' + elementor.translate( 'delete_global_' + globalType + '_info' ),
			strings: {
				confirm: elementor.translate( 'delete' ),
				cancel: elementor.translate( 'cancel' ),
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
