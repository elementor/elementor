import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class OpenDefault extends CommandInternalBase {
	apply() {
		$e.route( elementor.documents.getCurrent().config.panel.default_route );

		return Promise.resolve();
	}
}

export default OpenDefault;
