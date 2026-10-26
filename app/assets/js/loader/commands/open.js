export class Open extends $e.modules.CommandBase {
	apply( args ) {
		const allFeatures = elementorCommon?.config?.allExperimentalFeatures;

		if ( allFeatures && 'theme_builder_v2' in allFeatures && ! allFeatures.theme_builder_v2 ) {
			const url = args.url || elementorAppConfig.menu_url;
			const isSiteEditorUrl = url.includes( 'page=elementor-app' ) && url.includes( 'site-editor' );

			if ( ! args.url || isSiteEditorUrl ) {
				window.top.location = url;
				return true;
			}
		}

		$e.route( 'app', args );

		return true;
	}
}

export default Open;
