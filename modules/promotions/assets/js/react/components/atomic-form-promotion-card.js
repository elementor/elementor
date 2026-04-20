import Lottie from 'lottie-react';
import { CrownFilledIcon } from '@elementor/icons';
import {
	Box,
	Button,
	ClickAwayListener,
	CloseButton,
	Stack,
	Typography,
} from '@elementor/ui';

import * as animationData from '../assets/atomic-form-animation.json';

const AtomicFormPromotionCard = ( props ) => {
	const { title, content, ctaText } = props.promotionData ?? {};

	return (
		<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ props.doClose }>
			<Box sx={ { width: 296 } }>
				<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ title }</Typography>
					<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
						icon: {
							fontSize: 'small',
						},
					} } onClick={ props.doClose } />
				</Stack>
				<Box sx={ { height: 150, width: '100%', overflow: 'hidden' } }>
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
						href={ props.ctaUrl }
						target="_blank"
						rel="noopener noreferrer"
					>{ ctaText }</Button>
				</Stack>
			</Box>
		</ClickAwayListener>
	);
};

AtomicFormPromotionCard.propTypes = {
	doClose: PropTypes.func,
	promotionData: PropTypes.object,
	ctaUrl: PropTypes.string,
};

export default AtomicFormPromotionCard;
