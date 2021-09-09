import CommandData from 'elementor-api/modules/command-data';

export class Templates extends CommandData {
	static getEndpointFormat() {
		return 'template-library/templates';
	}
}

export default Templates;
