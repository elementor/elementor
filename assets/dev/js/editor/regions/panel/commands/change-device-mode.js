export class ChangeDeviceMode extends $e.modules.CommandBase {
	apply( args = {} ) {
		const devices = elementor.breakpoints.getActiveBreakpointsList( { largeToSmall: true, withDesktop: true } );
		let { device } = args;

		if ( ! device ) {
			const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
			let modeIndex = devices.indexOf( currentDeviceMode );

			modeIndex++;

			if ( modeIndex >= devices.length ) {
				modeIndex = 0;
			}

			device = devices[ modeIndex ];
		}

		elementor.changeDeviceMode( device );
	}
}

export default ChangeDeviceMode;
