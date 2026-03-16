import * as React from 'react';
import Lottie from 'lottie-react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const celebrationData = require( '../assets/celebration.json' );

export function CelebrationLottie() {
	return (
		<Lottie
			animationData={ celebrationData }
			loop={ false }
			autoplay
			rendererSettings={ {
				preserveAspectRatio: 'xMidYMid slice',
			} }
			style={ {
				position: 'fixed',
				inset: 0,
				width: '100vw',
				height: '100vh',
				zIndex: 99999,
				pointerEvents: 'none',
			} }
		/>
	);
}
