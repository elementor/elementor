import Conditions from 'elementor/assets/dev/js/editor/utils/conditions';

const conditions = new Conditions();

export default class Controls {
	/**
	 * Get the value of a responsive control.
	 *
	 * Retrieves the value of a responsive control for the current device or for this first parent device which has a control value.
	 *
	 * @since 3.11.0
	 *
	 * @param {{}}     controlSettings A settings object (e.g. element settings - keys and values)
	 * @param {string} controlKey      The control key name
	 * @param {string} controlSubKey   A specific property of the control object.
	 * @param {string} device          If we want to get a value for a specific device mode.
	 * @return {*} Control Value
	 */
	getResponsiveControlValue( controlSettings, controlKey, controlSubKey = '', device = null ) {
		const currentDeviceMode = currentDeviceMode = device || elementorFrontend.getCurrentDeviceMode(),
			controlValueDesktop = conditions.getConditionValue( controlSettings, controlKey, controlSubKey );

		// Set the control value for the current device mode.
		// First check the widescreen device mode.
		if ( 'widescreen' === currentDeviceMode ) {
			const controlValueWidescreen = conditions.getConditionValue( controlSettings, `${ controlKey }_widescreen`, controlSubKey );

			return ( !! controlValueWidescreen || 0 === controlValueWidescreen ) ? controlValueWidescreen : controlValueDesktop;
		}

		// Loop through all responsive and desktop device modes.
		const activeBreakpoints = elementorFrontend.breakpoints.getActiveBreakpointsList( { withDesktop: true } );

		let parentDeviceMode = currentDeviceMode,
			deviceIndex = activeBreakpoints.indexOf( currentDeviceMode ),
			controlValue = '';

		while ( deviceIndex <= activeBreakpoints.length ) {
			if ( 'desktop' === parentDeviceMode ) {
				controlValue = controlValueDesktop;
				break;
			}

			const responsiveControlKey = `${ controlKey }_${ parentDeviceMode }`,
				responsiveControlValue = conditions.getConditionValue( controlSettings, responsiveControlKey, controlSubKey );

			if ( !! responsiveControlValue || 0 === responsiveControlValue ) {
				controlValue = responsiveControlValue;
				break;
			}

			// If no control value has been set for the current device mode, then check the parent device mode.
			deviceIndex++;
			parentDeviceMode = activeBreakpoints[ deviceIndex ];
		}

		return controlValue;
	}
}
