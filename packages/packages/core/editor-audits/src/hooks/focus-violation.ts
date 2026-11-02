import { getContainer, selectElement } from '@elementor/editor-elements';
import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type AuditViolation } from '../types';
import { type ViewIssueResult } from '../utils/tracking';

const SCROLL_TO_VIEW_DELAY_MS = 200;

export function focusViolation( violation: AuditViolation ): ViewIssueResult | null {
	if ( violation.elementId ) {
		const container = getContainer( violation.elementId );

		if ( container ) {
			selectElement( violation.elementId );

			const domElement = container.view?.getDomElement?.();

			if ( domElement ) {
				(
					window as unknown as {
						elementor?: { helpers?: { scrollToView?: ( element: unknown, timeout?: number ) => void } };
					}
				 ).elementor?.helpers?.scrollToView?.( domElement, SCROLL_TO_VIEW_DELAY_MS );
			}
		}

		if ( violation.targetHint === 'element-settings' ) {
			runCommand( 'panel/editor/open' );
		}

		return container ? 'element_focused' : null;
	}

	if ( violation.externalUrl ) {
		window.open( violation.externalUrl, '_blank' );
		return 'external_url_opened';
	}

	if ( violation.targetHint === 'page-settings' ) {
		openRoute( 'panel/page-settings/settings' );
		return 'page_settings_opened';
	}

	if ( violation.targetHint === 'site-settings' ) {
		runCommand( 'panel/global/open' );
		return 'site_settings_opened';
	}

	if ( violation.targetHint === 'site-identity-settings' ) {
		void runCommand( 'panel/global/open' ).then( () => {
			openRoute( 'panel/global/settings-site-identity' );
		} );
		return 'site_settings_opened';
	}

	return null;
}
