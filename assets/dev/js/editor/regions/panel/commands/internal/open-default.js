import CommandInternal from 'elementor-api/modules/command-internal';

export class OpenDefault extends CommandInternal {
	apply() {
		$e.route( elementor.documents.getCurrent().config.panel.default_route );

		return Promise.resolve();
	}
}

export default OpenDefault;
