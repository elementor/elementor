import CommandData from 'elementor-api/modules/command-data';

// Alphabetical order
export { Colors } from './colors';
export { Typography } from './typography';

// TODO: Remove - Move to into base, Possible to handle using ComponentData.
export class Index extends CommandData {
	static getEndpointFormat() {
		// Format 'globals/index' to 'globals'.
		return 'globals';
	}
}
