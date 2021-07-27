export class KitUpdateBreakpointsPreview extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'kit-update-breakpoints-preview';
	}

	getContainerType() {
		return 'document';
	}

	getConditions() {
		return 'kit' === elementor.documents.getCurrent().config.type;
	}

	apply( args ) {
		const { settings } = args;

		if ( settings.active_breakpoints ) {
			// Updating the config is necessary, even if the page has to be reloaded for these settings to take place,
			// because users can add breakpoints and then immediately give them a value, before saving the site
			// settings. The breakpoint control's validator needs to have the updated active breakpoints config in
			// order to validate the user input properly.
			elementor.documents.currentDocument.config.settings.settings.active_breakpoints = settings.active_breakpoints;

			// This flag is used to notify users that if they make a change to the active breakpoints list, they need
			// to reload the editor for the changes to take effect.
			elementor.activeBreakpointsUpdated = true;

			// Reset all breakpoints in the config to not-enabled, to make sure the config is updated with only the
			// enabled breakpoints following the input change.
			Object.keys( elementorFrontend.config.responsive.breakpoints ).forEach( ( breakpointName ) => {
				elementorFrontend.config.responsive.breakpoints[ breakpointName ].is_enabled = false;
			} );

			// Clear the active breakpoints object before repopulating it, to make sure unselected breakpoints are removed.
			elementorFrontend.config.responsive.activeBreakpoints = {};

			settings.active_breakpoints.forEach( ( breakpointName ) => {
				breakpointName = breakpointName.replace( 'viewport_', '' );
				// Set its state to enabled.
				elementorFrontend.config.responsive.breakpoints[ breakpointName ].is_enabled = true;
				// Add/re-add the breakpoint to the emptied activeBreakpoints object.
				elementorFrontend.config.responsive.activeBreakpoints[ breakpointName ] = elementorFrontend.config.responsive.breakpoints[ breakpointName ];
			} );

			// If this is the modified setting, no need to do further checks.
			return;
		}

		// If a breakpoint value was updated, update the value in the config.
		Object.entries( settings ).forEach( ( [ key, value ] ) => {
			if ( key.startsWith( 'viewport_' ) ) {
				const keyWithoutPrefix = key.replace( 'viewport_', '' );
				// Update both the config for all breakpoints and the one for active breakpoints.

				if ( ! value ) {
					value = elementorFrontend.config.responsive.breakpoints[ keyWithoutPrefix ].default_value;
				}

				elementorFrontend.config.responsive.breakpoints[ keyWithoutPrefix ].value = value;
			}
		} );

		elementor.updatePreviewResizeOptions( true );
	}
}
