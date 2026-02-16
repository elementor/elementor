import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export class Close extends $e.modules.CommandBase {
	apply( args ) {
		const { mode } = args;
		const hasSaved = this.component.siteSettingsSession?.hasSaved || false;

		this.trackSiteSettingsSession( 'close', hasSaved ? 'saved' : 'discard' );

		// The kit is opened directly.

		if ( elementor.config.initial_document.id === parseInt( elementor.config.kit_id ) ) {
			return $e.run( 'panel/global/exit' );
		}

		$e.internal( 'panel/state-loading' );

		return $e.run( 'editor/documents/switch', {
			mode,
			id: elementor.config.initial_document.id,
			onClose: ( document ) => {
				if ( document.isDraft() ) {
					elementor.toggleDocumentCssFiles( document, true );
					elementor.settings.page.destroyControlsCSS();
				}

				$e.components.get( 'panel/global' ).close();
				$e.routes.clearHistory( this.component.getServiceName() );

				// The kit shouldn't be cached for next open. (it may be changed via create colors/typography).
				elementor.documents.invalidateCache( elementor.config.kit_id );
			},
		} ).finally( () => $e.internal( 'panel/state-ready' ) );
	}

	trackSiteSettingsSession( targetType, state ) {
		const sessionData = this.component.getSiteSettingsSessionData?.() || {};

		EditorOneEventManager.sendSiteSettingsSession( {
			targetType,
			visitedItems: sessionData.visitedItems || [],
			savedItems: sessionData.savedItems || [],
			state,
		} );

		this.component.resetSiteSettingsSession?.();
	}
}

export default Close;
