import * as React from 'react';
import { useCallback, useState } from 'react';
import { ModalShell, useModalShell } from '@elementor/editor-modal-shell';
import { Box, Button, Stack, Typography } from '@elementor/ui';

import { type ExtendedWindow } from '../ajax/types';
import { SET_CTA_VISITED_ACTION } from '../constants';
import { type BirthdayEasterEggModalConfig } from '../types';
import { BirthdayBackgroundLottie } from './birthday-background-lottie';

type AppContentProps = {
	onClose: () => void;
	container?: HTMLElement;
	config: BirthdayEasterEggModalConfig;
};

export function AppContent( { onClose, container, config }: AppContentProps ) {
	const [ isLottieCompleted, setIsLottieCompleted ] = useState( false );

	return isLottieCompleted ? (
		<ModalShell
			onClose={ onClose }
			container={ container }
			revealDuration={ 0 }
			sx={ {
				display: 'flex',
				flexDirection: 'row',
				width: '900px',
				height: '432px',
				position: 'relative',
				'&::after': {
					content: '""',
					position: 'fixed',
					inset: 0,
					backgroundColor: 'common.white',
					zIndex: 10,
					pointerEvents: 'none',
					animation: 'e-modal-white-wash 700ms ease 250ms forwards',
				},
				'@keyframes e-modal-white-wash': {
					from: { opacity: 1 },
					to: { opacity: 0 },
				},
			} }
		>
			<Box
				sx={ {
					height: '100%',
					aspectRatio: '1',
					backgroundImage: `url(${ config.hero })`,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					backgroundSize: 'cover',
				} }
			/>
			<ContentPanel config={ config } />
		</ModalShell>
	) : (
		<BirthdayBackgroundLottie
			lottieData={ config.lottie }
			onLottieComplete={ () => setIsLottieCompleted( true ) }
		/>
	);
}

function ContentPanel( { config }: { config: BirthdayEasterEggModalConfig } ) {
	const { close } = useModalShell();

	const hidePromotion = useCallback( () => {
		const promotionElement = document.querySelector(
			'#elementor-panel-category-v4-elements .elementor-element-wrapper:has([data-library-element-type="e-birthday-easter-egg"])'
		);

		promotionElement?.remove();
	}, [] );

	const setCtaVisited = useCallback( () => {
		const ajax = ( window as ExtendedWindow ).elementorCommon?.ajax;

		ajax?.addRequest( SET_CTA_VISITED_ACTION, { data: { visited: false } }, true );
	}, [] );

	const onCtaVisit = useCallback( () => {
		hidePromotion();
		setCtaVisited();
		close();
	}, [ hidePromotion, close, setCtaVisited ] );

	return (
		<Stack
			sx={ {
				height: '100%',
				py: 5,
				paddingInlineStart: 4,
				paddingInlineEnd: 5,
				bgcolor: 'background.paper',
			} }
		>
			<Stack gap={ 2.5 } flexGrow={ 2 } sx={ { justifyContent: 'center' } }>
				<Typography variant="h4" color="text.secondary">
					{ config.header }
				</Typography>
				<Typography variant="body1" color="text.primary">
					{ config.content }
				</Typography>
			</Stack>
			<Button
				variant="contained"
				color="primary"
				size="large"
				href={ config.cta.url }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ onCtaVisit }
				sx={ { alignSelf: 'flex-end' } }
			>
				{ config.cta.label }
			</Button>
		</Stack>
	);
}
