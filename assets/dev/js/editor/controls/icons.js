const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );
class ControlIconsView extends ControlMultipleBaseItemView {
	ui() {
		const ui = super.ui();

		ui.frameOpeners = '.elementor-control-preview-area';
		ui.deleteButton = '.elementor-control-icon-delete';
		ui.previewContainer = '.elementor-control-icons-preview';

		return ui;
	}

	events() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openPicker',
			'click @ui.deleteButton': 'deleteIcon',
		} );
	}

	openPicker() {
		elementor.iconManager.show( { model: this } );
	}

	applySavedValue() {
		const iconValue = this.getControlValue( 'value' );
			//iconType = this.getControlValue( 'library' );

		const previewHTML = ( iconValue ) ? '<i class="' + iconValue + '"></i>' : '';
		this.ui.previewContainer.html( previewHTML );
		this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
	}

	deleteIcon( event ) {
		event.stopPropagation();

		this.setValue( {
			value: '',
			library: '',
		} );

		this.applySavedValue();
	}

	onBeforeDestroy() {
		this.$el.remove();
	}
}
module.exports = ControlIconsView;
