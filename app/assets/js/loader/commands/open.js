export class Open extends $e.modules.CommandBase {
	apply( args ) {
		const allFeatures = elementorCommon?.config?.allExperimentalFeatures;

		if ( allFeatures && 'theme_builder_v2' in allFeatures && ! allFeatures.theme_builder_v2 ) {
			window.top.location = args.url || elementorAppConfig.menu_url;
			return true;
		}

		$e.route( 'app', args );

		return true;
	}
}

export default Open;
