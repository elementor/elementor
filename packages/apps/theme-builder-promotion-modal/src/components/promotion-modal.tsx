import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { ModalShell, useModalShell } from '@elementor/editor-modal-shell';
import { Box, Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { ExtendedWindow, OpenEventDetail, ThemeBuilderPromotionScenario } from '../types';

const MODAL_WIDTH = 893;
const MODAL_HEIGHT = 432;
const IMAGE_PANEL_WIDTH = 416;

type Props = {
	container?: HTMLElement;
	scenario: ThemeBuilderPromotionScenario;
	assets: OpenEventDetail[ 'assets' ];
	onClose: () => void;
};

export function PromotionModal( { container, scenario, assets, onClose }: Props ) {
	return (
		<ModalShell
			onClose={ onClose }
			container={ container }
			revealDuration={ 1500 }
			sx={ {
				display: 'flex',
				flexDirection: 'row',
				width: `${ MODAL_WIDTH }px`,
				height: `${ MODAL_HEIGHT }px`,
			} }
		>
			<ModalContent scenario={ scenario } assets={ assets } />
		</ModalShell>
	);
}

function ModalContent( {
	scenario,
	assets,
}: {
	scenario: ThemeBuilderPromotionScenario;
	assets: OpenEventDetail[ 'assets' ];
} ) {
	const { close } = useModalShell();

	const { title, body, imageUrl } = assets;

	const track = useCallback( ( payload: Record< string, unknown > ) => {
		( window as ExtendedWindow ).elementorCommon?.eventsManager?.dispatchEvent?.(
			'theme_builder_promotion',
			payload
		);
	}, [] );

	const openThemeBuilder = useCallback( () => {
		try {
			( window as ExtendedWindow ).$e?.run?.( 'app/open' );
		} catch {
			open( ( window as ExtendedWindow ).elementorCommon?.config?.home_url || '/', '_blank' );
		}
	}, [] );

	const onOpenThemeBuilder = useCallback( async () => {
		track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'open_theme_builder',
			interaction_result: 'opened_theme_builder',
			target_location: `introduce_theme_builder_${ scenario }_popup`,
			location_l1: 'open_theme_builder_button',
		} );

		close();
		openThemeBuilder();
	}, [ close, openThemeBuilder, scenario, track ] );

	useEffect( () => {
		track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'popup_shown',
			target_type: 'popup',
			target_name: `introduce_theme_builder_${ scenario }_popup`,
			interaction_result: 'popup_viewed',
			target_location: 'editor',
			location_l1: scenario,
		} );
	}, [ scenario, track ] );

	return (
		<>
			<Box
				sx={ {
					flex: `0 0 ${ IMAGE_PANEL_WIDTH }px`,
					backgroundColor: '#f2f3f5',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
				} }
			>
				<Box
					component="img"
					src={ imageUrl }
					alt={ __( 'Theme builder promotion image', 'elementor' ) }
					sx={ {
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					} }
				/>
			</Box>

			<Stack
				sx={ {
					flex: 1,
					py: 5,
					paddingInlineStart: 4,
					paddingInlineEnd: 5,
					bgcolor: 'background.paper',
					justifyContent: 'space-between',
				} }
				gap={ 4 }
			>
				<Stack gap={ 2.5 } sx={ { justifyContent: 'center', flexGrow: 1 } }>
					<Typography variant="h4" color="text.secondary" dangerouslySetInnerHTML={ { __html: title } } />
					<Typography variant="body1" color="text.primary" dangerouslySetInnerHTML={ { __html: body } } />
				</Stack>

				<Stack direction="row" justifyContent="flex-end" gap={ 1.5 }>
					<Button
						variant="contained"
						color="inherit"
						onClick={ onOpenThemeBuilder }
						sx={ {
							backgroundColor: 'common.black',
							color: 'common.white',
							borderRadius: '12px',
							fontSize: '14px',
							fontWeight: 600,
							lineHeight: '20px',
							paddingInline: '24px',
							minHeight: '44px',
							'&:hover': { backgroundColor: 'common.black', color: 'common.white' },
						} }
					>
						{ __( 'Open Theme Builder', 'elementor' ) }
					</Button>
				</Stack>
			</Stack>
		</>
	);
}
