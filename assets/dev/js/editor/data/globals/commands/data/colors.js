import CommandData from 'elementor-api/modules/command-data';

export class Colors extends CommandData {
	static getEndpointFormat() {
		return 'globals/colors/{id}';
	}
}

export default Colors;
