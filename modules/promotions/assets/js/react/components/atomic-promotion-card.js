import PropTypes from 'prop-types';
import { CrownFilledIcon } from '@elementor/icons';
import {
	Box,
	Button,
	ClickAwayListener,
	CloseButton,
	Stack,
	Typography,
} from '@elementor/ui';

import { AtomicPromotionMedia } from '../atomic-promotion-media';

const CARD_WIDTH = 296;

const AtomicPromotionCard = ( { doClose, promotionData } ) => {
	const { title, content, ctaText, ctaUrl, image, animationData } = promotionData ?? {};

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
				<AtomicPromotionMedia image={ image } animationData={ animationData } />
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
