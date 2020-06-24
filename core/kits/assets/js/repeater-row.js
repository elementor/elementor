import RepeaterRow from '../../../../assets/dev/js/editor/controls/repeater-row';

export default class extends RepeaterRow {
	getTemplate() {
		return '#tmpl-elementor-global-style-repeater-row';
	}

	updateColorValue() {
		const color = this.model.get( 'color' );

		this.$colorValue.text( color );
	}

	getRemoveButton() {
		return this.ui.removeButton.add( this.$el.find( '.elementor-repeater-tool-remove--disabled' ) );
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
	}

	onModelChange( model ) {
		if ( undefined !== model.changed.color ) {
			this.updateColorValue();
		}
	}
}
