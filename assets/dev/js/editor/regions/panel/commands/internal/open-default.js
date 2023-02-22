export class OpenDefault extends $e.modules.CommandInternalBase {
	apply( args = {} ) {
		$e.route( elementor.documents.getCurrent().config.panel.default_route, args );

		return Promise.resolve();
	}
}

export default OpenDefault;
