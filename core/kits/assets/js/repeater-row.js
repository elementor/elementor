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
		this.$colorValue.text( this.model.get( 'value' ) );
	}

	getRemoveButton() {
		return this.ui.removeButton.add( this.$el.find( '.elementor-repeater-tool-remove--disabled' ) );
	}

	triggers() {
		return {};
	}

	onChildviewRender( childView ) {
		if ( 'color' === childView.model.get( 'type' ) ) {
			this.$colorValue = jQuery( '<div>', { class: 'elementor-global-colors__color-value' } );

			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.prepend( this.getRemoveButton(), this.$colorValue );

			this.updateColorValue();
		}

		if ( 'popover_toggle' === childView.model.get( 'type' ) ) {
			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.append( this.getRemoveButton() );
		}

		this.ui.removeButton.tipsy( {
			title: () => elementor.translate( 'delete_global_color' ),
			gravity: () => 's',
		} );
	}

	onModelChange( model ) {
		if ( undefined !== model.changed.value ) {
			this.updateColorValue();
		}
	}

	onRemoveButtonClick() {
		this.confirmDeleteModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'elementor-global-confirm-delete',
			headerMessage: elementor.translate( 'delete_global_color' ),
			message: elementor.translate( 'delete_global_color_info' ),
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
