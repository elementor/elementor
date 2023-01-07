const ControlBaseDataView = require( 'elementor-controls/base-data' );

export default class extends ControlBaseDataView {
	onReady() {
		const options = _.extend( {
			enableTime: true,
			minuteIncrement: 1,
		}, this.model.get( 'picker_options' ) );

		this.ui.input.flatpickr( options );
	}

	onBaseInputChange() {
		super.onBaseInputChange( ...arguments );

		if ( ! this.model.attributes?.validation ) {
			return;
		}

		if ( this.model.attributes?.validation.minDate ) {
			const controlName = this.model.attributes.validation.minDate.control_name;

			const startDate = this.options.container.settings.get( controlName );
			if ( ! startDate ) {
				return;
			}

			const endDate = this.ui.input.val();
			const startDateTimestamp = new Date( startDate ).getTime();
			const endDateTimestamp = new Date( endDate ).getTime();
			const operator = this.model.attributes.validation.minDate.operator;

			if ( elementor.conditions.compare( startDateTimestamp, endDateTimestamp, operator ) ) {
				this.ui.input.val( '' );
			}
		}
	}

	onBeforeDestroy() {
		this.ui.input.flatpickr().destroy();
	}
}
