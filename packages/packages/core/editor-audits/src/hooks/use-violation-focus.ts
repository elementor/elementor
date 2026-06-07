import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type AuditViolation } from '../types';

declare global {
	interface Window {
		elementor?: {
			getContainer?: ( id: string ) => {
				view?: {
					getDomElement?: () => unknown;
				};
			} | null;
			helpers?: {
				scrollToView?: ( element: unknown, timeout?: number ) => void;
			};
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

					const domElement = container.view?.getDomElement?.();

					if ( domElement ) {
						window.elementor?.helpers?.scrollToView?.( domElement, 200 );
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
		},
	};
}
