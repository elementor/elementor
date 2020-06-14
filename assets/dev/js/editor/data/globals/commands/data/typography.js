import CommandData from 'elementor-api/modules/command-data';

export class Typography extends CommandData {
	static getEndpointFormat() {
		return 'globals/typography/{id}';
	}
}

export default Typography;
