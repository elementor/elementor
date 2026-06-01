import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type AuditViolation } from '../types';

declare global {
	interface Window {
		elementor?: {
			getContainer?: ( id: string ) => unknown;
		};
	}
}

export function useViolationFocus() {
	return {
		focus( violation: AuditViolation ): void {
			if ( violation.elementId ) {
				const container = window.elementor?.getContainer?.( violation.elementId );

				if ( container ) {
					runCommand( 'document/elements/select', { container } );
				}

				if ( violation.targetHint === 'element-settings' ) {
					runCommand( 'panel/editor/open' );
				}

				return;
			}

			if ( violation.targetHint === 'page-settings' ) {
				openRoute( 'panel/page-settings/settings' );
				return;
			}

			if ( violation.targetHint === 'site-settings' ) {
				runCommand( 'panel/global/open' );
			}
		},
	};
}
