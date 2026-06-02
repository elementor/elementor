import * as React from 'react';
import { BackgroundLottie } from '@elementor/editor-modal-shell';

import * as celebrationData from '../assets/celebration.json';

export function CelebrationLottie() {
	return <BackgroundLottie animationData={ celebrationData } loop={ false } />;
}
