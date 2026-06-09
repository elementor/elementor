import { __ } from '@wordpress/i18n';
import {
	Box,
	ClickAwayListener,
	CloseButton,
	Image,
	Stack,
	Typography,
	Button,
} from '@elementor/ui';
import { CrownFilledIcon } from '@elementor/icons';
import PropTypes from 'prop-types';

const CARD_WIDTH = 296;
const IMAGE_HEIGHT = 176;

const WidgetPromotionCard = ( { doClose, promotionData } ) => {
	const { title, content, image, ctaUrl } = promotionData;

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
				<Stack px={ 2 }>
					<Typography variant="body2" color="secondary" sx={ { pt: 1.5, pb: 1 } }>
						{ content }
					</Typography>
				</Stack>
				<Stack pt={ 1 } pb={ 1.5 } px={ 2 }>
					<Button
						variant="contained"
						size="small"
						color="promotion"
						href={ ctaUrl }
						target="_blank"
						startIcon={ <CrownFilledIcon /> }
						sx={ { ml: 'auto' } }
					>
						{ __( 'Upgrade Now', 'elementor' ) }
					</Button>
				</Stack>
			</Box>
		</ClickAwayListener>
	);
};

WidgetPromotionCard.propTypes = {
	doClose: PropTypes.func,
	promotionData: PropTypes.object,
};

export default WidgetPromotionCard;
