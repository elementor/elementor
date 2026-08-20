import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import { Box, Image } from '@elementor/ui';

import * as atomicFormAnimationData from './assets/atomic-form-animation.json';

const CARD_WIDTH = 296;
const IMAGE_HEIGHT = 176;
const ANIMATION_HEIGHT = 150;

const PROMOTION_ANIMATIONS = {
	'atomic-form-animation': atomicFormAnimationData,
};

export function resolvePromotionAnimation( animationKey ) {
	return PROMOTION_ANIMATIONS[ animationKey ] ?? null;
}

export function AtomicPromotionMedia( { image, animationData } ) {
	if ( image ) {
		return (
			<Image src={ image } alt="" sx={ { width: CARD_WIDTH, height: IMAGE_HEIGHT } } />
		);
	}

	if ( animationData ) {
		return (
			<Box sx={ { height: ANIMATION_HEIGHT, width: '100%', overflow: 'hidden' } } data-testid="e-atomic-form-animation">
				<Lottie
					animationData={ animationData }
					loop={ true }
					autoplay={ true }
					rendererSettings={ {
						preserveAspectRatio: 'xMidYMid slice',
					} }
					style={ { width: '100%', height: '100%' } }
				/>
			</Box>
		);
	}

	return null;
}

AtomicPromotionMedia.propTypes = {
	animationData: PropTypes.object,
	image: PropTypes.string,
};
