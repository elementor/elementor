import { __ } from '@wordpress/i18n';
import {
	Box,
	Button,
	Chip,
	ClickAwayListener,
	CloseButton,
	Image,
	Stack,
	Typography,
} from '@elementor/ui';
import { CrownFilledIcon } from '@elementor/icons';
import PropTypes from 'prop-types';

const CARD_WIDTH = 296;
const IMAGE_HEIGHT = 176;
const DEFAULT_CTA_TEXT = __( 'Upgrade Now', 'elementor' );

const WidgetPromotionCard = ( { doClose, promotionData } ) => {
	const { title, content, image, ctaUrl, ctaText, hideProTag } = promotionData;

	return (
		<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ doClose }>
			<Box sx={ { width: CARD_WIDTH } }>
				<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ title }</Typography>
					{ hideProTag && (
						<Chip label={ __( 'Free', 'elementor' ) } size="tiny" variant="standard" color="secondary" sx={ { ml: 1 } } />
					) }
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
						color={ hideProTag ? 'info' : 'promotion' }
						href={ ctaUrl }
						target="_blank"
						rel="noopener noreferrer"
						startIcon={ hideProTag ? null : <CrownFilledIcon /> }
						sx={ { ml: 'auto' } }
					>
						{ ctaText || DEFAULT_CTA_TEXT }
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
