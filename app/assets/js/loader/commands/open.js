export class Open extends $e.modules.CommandBase {
	apply( args ) {
		const allFeatures = elementorCommon?.config?.allExperimentalFeatures;

		if ( allFeatures && 'theme_builder_v2' in allFeatures && ! allFeatures.theme_builder_v2 ) {
			const menuUrl = elementorAppConfig.menu_url;

			if ( 'string' === typeof menuUrl && menuUrl ) {
				const isSiteEditorUrl = args.url?.includes( 'page=elementor-app' ) && args.url.includes( 'site-editor' );

				if ( ! args.url || isSiteEditorUrl ) {
					window.top.location.href = menuUrl;
					return true;
				}
			}
		}

		$e.route( 'app', args );

		return true;
	}
}

export default Open;
