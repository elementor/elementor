import { __ } from '@wordpress/i18n';
import {
	ClickAwayListener,
	Image,
	Box,
	Chip,
	Typography,
	Button,
	CloseButton,
	Stack,
	List,
	ListItem,
} from '@elementor/ui';

const PromotionCard = ( { doClose, promotionsData } ) => {
	const title = promotionsData?.title,
		description = promotionsData?.description,
		imgSrc = promotionsData?.image,
		imgAlt = promotionsData?.image_alt,
		ctaText = promotionsData?.upgrade_text,
		ctaUrl = promotionsData?.upgrade_url;

	const redirectHandler = () => {
		window.open( ctaUrl, '_blank' );
		return doClose();
	};

	return (
		<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ doClose }>
			<Box sx={ { width: 296 } }>
				<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ title }</Typography>
					<Chip label={ __( 'PRO', 'elementor' ) } size="small" variant="outlined" color="promotion" sx={ { ml: 1 } } />
					<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
						icon: {
							fontSize: 'small',
						},
					} } onClick={ doClose } />
				</Stack>
				<Image src={ imgSrc } alt={ imgAlt } sx={ { height: 150, width: '100%' } } />
				<Stack px={ 2 }>
					<List sx={ { pl: 2 } }>
						{ description.map( ( text, index ) => {
							return (
								<ListItem key={ index } sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
									<Typography variant="body2" color="secondary">{ text }</Typography>
								</ListItem>
							);
						} ) }
					</List>
				</Stack>
				<Stack pt={ 1 } pb={ 1.5 } px={ 2 }>
					<Button
						variant="contained"
						size="small"
						color="promotion"
						onClick={ redirectHandler }
						sx={ { ml: 'auto' } }
					>{ ctaText }</Button>
				</Stack>
			</Box>
		</ClickAwayListener>
	);
};

PromotionCard.propTypes = {
	doClose: PropTypes.func,
	promotionsData: PropTypes.object,
};

export default PromotionCard;
