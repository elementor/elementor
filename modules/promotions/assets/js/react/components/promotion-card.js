import {
	ClickAwayListener,
	Image,
	Box,
	Chip,
	Typography,
	Button,
	CloseButton,
	Stack,
} from '@elementor/ui';

const PromotionCard = ( { doClose, promotionsData } ) => {
	const title = promotionsData?.title;
	const description = promotionsData?.description;
	const imgSrc = promotionsData?.image;
	const ctaText = promotionsData?.upgrade_text;
	const ctaUrl = promotionsData?.upgrade_url;

	const handleClose = () => {
		return doClose();
	};

	const redirectHandler = () => {
		return window.open( ctaUrl, '_blank' );
	};

	return (
		<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ handleClose }>
			<Box sx={ { width: 296 } }>
				<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ title }</Typography>
					<Chip label="PRO" size="small" variant="outlined" color="promotion" sx={ { ml: 1 } } />
					<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
						icon: {
							fontSize: 'small',
						},
					} } onClick={ handleClose } />
				</Stack>
				<Image src={ imgSrc } sx={ { height: 150, width: '100%' } }
				/>
				<Stack py={ 1 } px={ 2 }>
					{ description.map( ( e, index ) => {
						return ( <Typography key={ index } variant="body2" color="secondary">&bull; { e }</Typography> );
					} ) }
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
