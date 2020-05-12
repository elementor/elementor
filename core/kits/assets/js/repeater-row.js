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
		const color = this.model.get( 'color' );

		this.$colorValue.text( color );
	}

	triggers() {
		return {};
	}

	onChildviewRender( childView ) {
		if ( 'color' === childView.model.get( 'type' ) ) {
			this.$colorValue = jQuery( '<div>', { class: 'elementor-global-colors__color-value' } );

			childView.$el
				.find( '.elementor-control-input-wrapper' )
				.prepend( this.ui.removeButton, this.$colorValue );

			this.updateColorValue();
		}
	}

	onModelChange( model ) {
		if ( undefined !== model.changed.color ) {
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
