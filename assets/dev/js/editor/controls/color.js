import ControlBaseDataView from './base-data';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-control-input-wrapper';

		return ui;
	}

	applySavedValue() {
		if ( this.picker ) {
			this.picker.setColor( this.getControlValue() );
		} else {
			this.initPicker();
		}
	}

	initPicker() {
		const options = {
			el: this.ui.pickerContainer[ 0 ],
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
			opacity: this.model.get( 'alpha' ),
		};

		const value = this.getControlValue();

		if ( value ) {
			options.default = value;
		}

		this.picker = elementor.helpers.colorPicker( options );
	}

	onPickerChange() {
		this.picker.applyColor();

		this.setValue( this.picker.getColor().toRGBA().toString() );
	}

	onPickerClear() {
		this.setValue( '' );
	}

	onBeforeDestroy() {
		this.picker.destroyAndRemove();
	}
}
