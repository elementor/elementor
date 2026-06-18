import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { ModalShell, useModalShell } from '@elementor/editor-modal-shell';
import { Box, Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { ExtendedWindow, ThemeBuilderPromotionScenario } from '../types';

const MODAL_WIDTH = 893;
const MODAL_HEIGHT = 432;
const IMAGE_PANEL_WIDTH = 416;

type Props = {
	container?: HTMLElement;
	scenario: ThemeBuilderPromotionScenario;
	introductionKey: string;
	onClose: () => void;
};

export function PromotionModal( { container, scenario, introductionKey, onClose }: Props ) {
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
			<ModalContent scenario={ scenario } introductionKey={ introductionKey } />
		</ModalShell>
	);
}

function ModalContent( {
	scenario,
	introductionKey,
}: {
	scenario: ThemeBuilderPromotionScenario;
	introductionKey: string;
} ) {
	const { close } = useModalShell();

	const { title, body, imageUrl } = useMemo( () => getDialogContent( scenario ), [ scenario ] );

	const track = useCallback( ( payload: Record<string, unknown> ) => {
		try {
			( window as ExtendedWindow ).elementorCommon?.eventsManager?.dispatchEvent?.( 'theme_builder_promotion', payload );
		} catch {
			// Analytics should never break the user flow.
		}
	}, [] );

	const setViewed = useCallback( async () => {
		const w = window as ExtendedWindow;

		if ( ! w.elementor?.config?.user?.introduction ) {
			return;
		}

		w.elementor.config.user.introduction[ introductionKey ] = true;

		try {
			await w.elementorCommon?.ajax?.addRequest( 'introduction_viewed', {
				data: { introductionKey },
			} );
		} catch {
			// Analytics gating should never break the user flow.
		}
	}, [ introductionKey ] );

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

		await setViewed();
		close();
		openThemeBuilder();
	}, [ close, openThemeBuilder, scenario, setViewed, track ] );

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
					<Typography variant="body1" color="text.primary">
						{ body }
					</Typography>
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

function getDialogContent( scenario: ThemeBuilderPromotionScenario ) {
	const assetBase = ( window as ExtendedWindow ).elementorCommon?.config?.urls?.assets || '';

	if ( 'single_product' === scenario ) {
		return {
			title: __( 'Create a seamless shopping experience.', 'elementor' ),
			body: __( 'Keep your store looking professional by using a unified, high-converting layout for all your products.' ) + '<br />' + __( 'Design it once, apply it everywhere.', 'elementor' ),
			imageUrl: `${ assetBase }images/theme-builder-promotion/tb-product.png`,
		};
	}

	if ( 'header_footer' === scenario ) {
		return {
			title: __( 'Tie your whole website together', 'elementor' ),
			body: __( 'Every great website needs consistent navigation.' ) + '<br />' + __( 'Build your Header and Footer in the Theme Builder and apply them globally in seconds.', 'elementor' ),
			imageUrl: `${ assetBase }images/theme-builder-promotion/tb-header-footer.png`,
		};
	}

	return {
		title: __( 'Stop designing posts from scratch', 'elementor' ),
		body: __( 'Why recreate your layout every time?' ) + '<br />' + __( 'Work smarter, not harder. Build a Single Post template to automatically apply to all future blog posts.', 'elementor' ),
		imageUrl: `${ assetBase }images/theme-builder-promotion/tb-post.png`,
	};
}

