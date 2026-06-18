import Lottie from 'lottie-react';
import { CrownFilledIcon } from '@elementor/icons';
import {
	Box,
	Button,
	ClickAwayListener,
	CloseButton,
	Image,
	Stack,
	Typography,
} from '@elementor/ui';

import * as atomicFormAnimationData from '../assets/atomic-form-animation.json';

const CARD_WIDTH = 296;
const IMAGE_HEIGHT = 176;
const ANIMATION_HEIGHT = 150;

const PROMOTION_ANIMATIONS = {
	'atomic-form': atomicFormAnimationData,
};

const AtomicPromotionCard = ( { doClose, promotionData } ) => {
	const { title, content, ctaText, ctaUrl, image, animation } = promotionData ?? {};
	const animationData = PROMOTION_ANIMATIONS[ animation ];

	return (
		<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ doClose }>
			<Box sx={ { width: CARD_WIDTH } }>
				<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ title }</Typography>
					<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
						icon: {
							fontSize: 'small',
						},
					} } onClick={ doClose } />
				</Stack>
				{ image && (
					<Image src={ image } alt="" sx={ { width: CARD_WIDTH, height: IMAGE_HEIGHT } } />
				) }
				{ ! image && animationData && (
					<Box sx={ { height: ANIMATION_HEIGHT, width: '100%', overflow: 'hidden' } }>
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
				) }
				<Stack px={ 2 }>
					<Typography variant="body2" color="secondary" sx={ { pt: 1.5, pb: 1 } }>
						{ content }
					</Typography>
				</Stack>
				<Stack direction="row" pt={ 1 } pb={ 1.5 } px={ 2 }>
					<Button
						variant="contained"
						size="small"
						color="promotion"
						startIcon={ <CrownFilledIcon /> }
						href={ ctaUrl }
						target="_blank"
						rel="noopener noreferrer"
					>{ ctaText }</Button>
				</Stack>
			</Box>
		</ClickAwayListener>
	);
};

AtomicPromotionCard.propTypes = {
	doClose: PropTypes.func,
	promotionData: PropTypes.object,
};

export default AtomicPromotionCard;
