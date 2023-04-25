export function isMenuInDropdownMode( elementSettings ) {
	const activeBreakpointsList = elementorFrontend.breakpoints.getActiveBreakpointsList( { withDesktop: true } ),
		breakpointIndex = activeBreakpointsList.indexOf( elementSettings.breakpoint_selector ),
		currentDeviceModeIndex = activeBreakpointsList.indexOf( elementorFrontend.getCurrentDeviceMode() );

	return currentDeviceModeIndex <= breakpointIndex;
}
