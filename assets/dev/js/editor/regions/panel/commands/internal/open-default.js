import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class OpenDefault extends CommandInternalBase {
	apply( args = {} ) {
		$e.route( elementor.documents.getCurrent().config.panel.default_route, args );

		return Promise.resolve();
	}
}

export default OpenDefault;
