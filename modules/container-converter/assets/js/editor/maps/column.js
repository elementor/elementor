import { getDeviceKey, responsive } from './utils';

const map = () => ( {
	...responsive( '_inline_size', ( { deviceValue, breakpoint } ) => {
		const deviceKey = getDeviceKey( 'width', breakpoint );
		const newValue = {
			size: deviceValue,
			unit: '%',
		};

		return [ deviceKey, newValue ];
	} ),
	...responsive( 'content_position', ( { deviceValue, breakpoint } ) => {
		const optionsMap = {
			top: 'flex-start',
			bottom: 'flex-end',
		};

		const deviceKey = getDeviceKey( 'flex_justify_content', breakpoint );

		return [ deviceKey, optionsMap[ deviceValue ] || deviceValue ];
	} ),
	...responsive( 'space_between_widgets', ( { deviceValue, breakpoint } ) => {
		const deviceKey = getDeviceKey( 'flex_gap', breakpoint );
		const newValue = {
			size: deviceValue,
			column: '' + deviceValue,
			row: '' + deviceValue,
			unit: 'px',
		};

		return [ deviceKey, newValue ];
	} ),
} );

export default map;
