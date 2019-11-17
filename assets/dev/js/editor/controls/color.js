import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-control-input-wrapper';

		return ui;
	}

	applySavedValue() {
		if ( this.colorPicker ) {
			this.colorPicker.picker.setColor( this.getControlValue() );
		} else {
			this.initPicker();
		}
	}

	initPicker() {
		const options = {
			el: this.ui.pickerContainer[ 0 ],
			default: this.getControlValue(),
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
			components: {
				opacity: this.model.get( 'alpha' ),
			},
		};

		this.colorPicker = new ColorPicker( options );
	}

	onPickerChange() {
		this.setValue( this.colorPicker.getValue() );
	}

	onPickerClear() {
		this.setValue( '' );
	}

	onBeforeDestroy() {
		this.colorPicker.destroy();
	}
}
