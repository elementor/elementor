import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export class Close extends $e.modules.CommandBase {
	apply( args ) {
		const { mode } = args;

		// The kit is opened directly — no document switch needed, safe to track immediately.
		if ( elementor.config.initial_document.id === parseInt( elementor.config.kit_id ) ) {
			const hasSaved = this.component.siteSettingsSession?.hasSaved || false;
			const sessionData = this.component.getSiteSettingsSessionData?.() || {};

			EditorOneEventManager.sendSiteSettingsSession( {
				targetType: 'close',
				visitedItems: sessionData.visitedItems || [],
				savedItems: sessionData.savedItems || [],
				state: hasSaved ? 'saved' : 'discard',
			} );

			this.component.resetSiteSettingsSession?.();
			return $e.run( 'panel/global/exit' );
		}

		// Capture session data before the switch (it may be reset during onClose).
		const sessionSnapshot = this.component.getSiteSettingsSessionData?.() || {};

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
		} ).then( () => {
			// Skip if session was already tracked and reset (e.g. by back.js dialog).
			if ( ! sessionSnapshot.visitedItems?.length ) {
				return;
			}

			// Re-read hasSaved in case a save happened during the switch (e.g. "Save & leave").
			const hasSaved = sessionSnapshot.hasSaved || this.component.siteSettingsSession?.hasSaved || false;
			const state = hasSaved ? 'saved' : 'discard';

			EditorOneEventManager.sendSiteSettingsSession( {
				targetType: 'close',
				visitedItems: sessionSnapshot.visitedItems,
				savedItems: sessionSnapshot.savedItems || [],
				state,
			} );

			this.component.resetSiteSettingsSession?.();
		} ).catch( () => {} ).finally( () => $e.internal( 'panel/state-ready' ) );
	}
}

export default Close;
