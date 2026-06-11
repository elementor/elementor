import * as React from 'react';
import { useEffect } from 'react';
import { BackgroundLottie, MODAL_Z_INDEX } from '@elementor/editor-modal-shell';

type BirthdayBackgroundLottieProps = {
	lottieData: object;
	onLottieComplete: () => void;
};

export function BirthdayBackgroundLottie( { lottieData, onLottieComplete }: BirthdayBackgroundLottieProps ) {
	useEffect( () => {
		if ( ! lottieData ) {
			onLottieComplete();
		}
	}, [ lottieData, onLottieComplete ] );

	return (
		lottieData && (
			<BackgroundLottie
				onComplete={ onLottieComplete }
				animationData={ lottieData }
				loop={ false }
				zIndex={ MODAL_Z_INDEX + 1 }
			/>
		)
	);
}
