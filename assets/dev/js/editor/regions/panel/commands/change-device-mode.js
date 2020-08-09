import Command from 'elementor-api/modules/command';

export class ChangeDeviceMode extends Command {
	apply( args = {} ) {
		const devices = [ 'desktop', 'tablet', 'mobile' ];
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
