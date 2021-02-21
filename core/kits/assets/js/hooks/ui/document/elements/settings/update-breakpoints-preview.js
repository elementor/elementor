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

		// If the 'active_breakpoints' control was changed, we need to make sure that all of the breakpoints in the new
		// setting are now set to active.
		if ( settings.active_breakpoints ) {
			settings.active_breakpoints.forEach( ( breakpointName ) => {
				breakpointName = breakpointName.replace( 'viewport_', '' );
				// Set its state to enabled.
				elementorFrontend.config.responsive.breakpoints[ breakpointName ].is_enabled = true;
				// If the breakpoint wasn't active before, add the breakpoint to the active breakpoints config object.
				if ( ! elementorFrontend.config.responsive.activeBreakpoints[ breakpointName ] ) {
					elementorFrontend.config.responsive.activeBreakpoints[ breakpointName ] = elementorFrontend.config.responsive.breakpoints[ breakpointName ];
				}
			} );
		}

		// If a breakpoint value was updated, update the value in the config.
		Object.entries( settings ).forEach( ( [ key, value ] ) => {
			if ( -1 !== key.indexOf( 'viewport_' ) ) {
				const keyWithoutPrefix = key.replace( 'viewport_', '' );
				// Update both the config for all breakpoints and the one for active breakpoints.
				elementorFrontend.config.responsive.breakpoints[ keyWithoutPrefix ].value = value;
				elementorFrontend.config.responsive.activeBreakpoints[ keyWithoutPrefix ].value = value;
			}
		} );
	}
}
