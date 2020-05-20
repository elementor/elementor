import RepeaterRow from '../../../../assets/dev/js/editor/controls/repeater-row';

export default class extends RepeaterRow {
	getTemplate() {
		return '#tmpl-elementor-global-style-repeater-row';
	}

	updateColorValue() {
		const color = this.model.get( 'color' );

		this.$colorValue.text( color );
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
}
