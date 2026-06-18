import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Alert, Button, Snackbar } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { ExtendedWindow, ThemeBuilderPromotionScenario } from '../types';

type Props = {
	scenario: ThemeBuilderPromotionScenario;
	onClose: () => void;
};

export function PromotionAlert( { scenario, onClose }: Props ) {
	const track = useCallback( ( payload: Record<string, unknown> ) => {
		try {
			( window as ExtendedWindow ).elementorCommon?.eventsManager?.dispatchEvent?.( 'theme_builder_promotion', payload );
		} catch {
			// Analytics should never break the user flow.
		}
	}, [] );

	const openThemeBuilder = useCallback( () => {
		try {
			( window as ExtendedWindow ).$e?.run?.( 'app/open' );
		} catch {
			open( ( window as ExtendedWindow ).elementorCommon?.config?.home_url || '/', '_blank' );
		}
	}, [] );

	useEffect( () => {
		track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'popup_shown',
			target_type: 'popup',
			target_name: `introduce_theme_builder_${ scenario }_alert`,
			interaction_result: 'popup_viewed',
			target_location: 'editor',
			location_l1: scenario,
		} );
	}, [ scenario, track ] );

	const onCtaClick = useCallback( () => {
		track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'open_theme_builder',
			interaction_result: 'opened_theme_builder',
			target_location: `introduce_theme_builder_${ scenario }_alert`,
			location_l1: 'open_theme_builder_button',
		} );

		onClose();
		openThemeBuilder();
	}, [ onClose, openThemeBuilder, scenario, track ] );

	const onDismiss = useCallback( () => {
		track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'dismiss',
			interaction_result: 'dismiss',
			target_location: `introduce_theme_builder_${ scenario }_alert`,
			location_l1: 'dismiss_button',
		} );

		onClose();
	}, [ onClose, scenario, track ] );

	return (
		<Snackbar open onClose={ onDismiss } anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }>
			<Alert
				onClose={ onDismiss }
				variant="filled"
				severity="info"
				sx={ {
					borderRadius: 2,
					alignItems: 'center',
				} }
				action={
					<Button color="inherit" size="small" onClick={ onCtaClick } sx={ { whiteSpace: 'nowrap' } }>
						{ __( 'Open Theme Builder', 'elementor' ) }
					</Button>
				}
			>
				{ __( 'Tip: Speed up your workflow with Theme Builder.', 'elementor' ) }
			</Alert>
		</Snackbar>
	);
}

