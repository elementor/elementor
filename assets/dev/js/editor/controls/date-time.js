const ControlBaseDataView = require( 'elementor-controls/base-data' );

export default class extends ControlBaseDataView {
	onReady() {
		const options = _.extend( {
			enableTime: true,
			minuteIncrement: 1,
		}, this.model.get( 'picker_options' ) );

		this.ui.input.flatpickr( options );
	}

	onBeforeDestroy() {
		this.ui.input.flatpickr().destroy();
	}
}
