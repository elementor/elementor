import * as React from 'react';
import Lottie from 'lottie-react';

import * as celebrationData from '../assets/celebration.json';
import { MODAL_Z_INDEX} from './v4-activation-modal';

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
				zIndex: MODAL_Z_INDEX-1,
				pointerEvents: 'none',
			} }
		/>
	);
}
