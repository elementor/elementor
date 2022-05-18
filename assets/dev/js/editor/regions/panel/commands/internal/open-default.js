export class OpenDefault extends $e.modules.CommandInternalBase {
	apply( args = {} ) {
		$e.route( elementor.documents.getCurrent().config.panel.default_route, args, {
			source: 'panel',
		} );

		return Promise.resolve();
	}
}

export default OpenDefault;
