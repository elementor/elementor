import * as React from 'react';
import { useEffect } from 'react';
import Lottie from 'lottie-react';

import { MODAL_Z_INDEX } from './modal-shell';

type BackgroundLottieProps = {
	animationData: object;
	loop?: boolean;
	autoplay?: boolean;
	zIndex?: number;
	backgroundColor?: string;
	onComplete?: () => void;
};

export function BackgroundLottie( {
	animationData,
	loop = false,
	autoplay = true,
	zIndex = MODAL_Z_INDEX - 1,
	backgroundColor = 'transparent',
	onComplete = () => {},
}: BackgroundLottieProps ) {
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches;

	useEffect( () => {
		if ( prefersReducedMotion ) {
			onComplete?.();
		}
	}, [ prefersReducedMotion, onComplete ] );
	if ( prefersReducedMotion ) {
		return null;
	}

	return (
		<Lottie
			animationData={ animationData }
			loop={ loop }
			autoplay={ autoplay }
			onComplete={ loop ? undefined : onComplete }
			onDataFailed={ onComplete }
			rendererSettings={ {
				preserveAspectRatio: 'xMidYMid slice',
			} }
			style={ {
				position: 'fixed',
				inset: 0,
				width: '100vw',
				height: '100vh',
				zIndex,
				backgroundColor,
				pointerEvents: 'none',
			} }
		/>
	);
}
