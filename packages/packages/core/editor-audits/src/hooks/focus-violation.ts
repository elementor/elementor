import { getContainer, selectElement } from '@elementor/editor-elements';
import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type AuditViolation } from '../types';

const SCROLL_TO_VIEW_DELAY_MS = 200;

export function focusViolation( violation: AuditViolation ): void {
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

		return;
	}

	if ( violation.externalUrl ) {
		window.open( violation.externalUrl, '_blank' );
		return;
	}

	if ( violation.targetHint === 'page-settings' ) {
		openRoute( 'panel/page-settings/settings' );
		return;
	}

	if ( violation.targetHint === 'site-settings' ) {
		runCommand( 'panel/global/open' );
		return;
	}

	if ( violation.targetHint === 'site-identity-settings' ) {
		void runCommand( 'panel/global/open' ).then( () => {
			openRoute( 'panel/global/settings-site-identity' );
		} );
	}
}
