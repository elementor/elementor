export function isMenuInDropdownMode( elementSettings ) {
	if ( 'dropdown' === elementSettings.item_layout ) {
		return true;
	}

	const activeBreakpointsList = elementorFrontend.breakpoints.getActiveBreakpointsList( { withDesktop: true } ),
		breakpointIndex = activeBreakpointsList.indexOf( elementSettings.breakpoint_selector ),
		currentDeviceModeIndex = activeBreakpointsList.indexOf( elementorFrontend.getCurrentDeviceMode() );

	return currentDeviceModeIndex <= breakpointIndex;
}
