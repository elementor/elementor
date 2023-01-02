const ControlBaseDataView = require( 'elementor-controls/base-data' );

export default class extends ControlBaseDataView {
	onReady() {
		const options = _.extend( {
			enableTime: true,
			minuteIncrement: 1,
		}, this.model.get( 'picker_options' ) );

		this.ui.input.flatpickr( options );
	}

	events() {
		return {
			'change @ui.input': 'onBaseInputChange',
		};
	}

	onBaseInputChange() {
		if ( this.model.attributes.verify_min_date_field?.active ) {
				const startDate = document.querySelector( `[data-setting=${ this.model.attributes.verify_min_date_field.compare_field_name }]` )?.value;
				if ( ! startDate ) {
					return;
				}
				const endDate = this.ui.input[ 0 ].value;
				const startDateTimestamp = new Date( startDate ).getTime();
				const endDateTimestamp = new Date( endDate ).getTime();
				if ( startDateTimestamp > endDateTimestamp ) {
					this.ui.input[ 0 ].value = '';
					// TODO: Add a message to the user
				}
		}
	}

	onBeforeDestroy() {
		this.ui.input.flatpickr().destroy();
	}
}
