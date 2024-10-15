import {
	Image,
	Chip,
	CardMedia,
	CardContent,
	Typography,
	CardActions,
	Button,
	CloseButton,
	Stack,
} from '@elementor/ui';

const PromotionCard = ( { onClose, promotionsData } ) => {
	const title = promotionsData?.title;
	const description = promotionsData?.description;
	const imgSrc = promotionsData?.image;
	const ctaText = promotionsData?.upgrade_text;
	const ctaUrl = promotionsData?.upgrade_url;

	const redirectHandler = () => {
		return window.open( ctaUrl, '_blank' );
	};

	return (
		<Box sx={ { width: 296 } }>
			<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
				<Typography variant="subtitle2">{ title }</Typography>
				<Chip label="PRO" size="small" variant="outlined" color="promotion" sx={ { ml: 1, fontWeight: 400 } } />
				<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
					icon: {
						fontSize: 'small',
					},
				} } onClose={ onClose } />
			</Stack>
			<Image src={ imgSrc } sx={ { height: 150 } }
			/>
			<Box>
				{ description.map( ( e, index ) => {
					return ( <Typography key={ index } variant="body2" color="secondary">&bull; { e }</Typography> );
				} ) }
			</Box>
			<Box sx={ { pt: 1 } }>
				<Button
					variant="contained"
					size="small"
					color="promotion"
					onClick={ redirectHandler }
				>{ ctaText }</Button>
			</Box>
		</Box>
	);
};

PromotionCard.propTypes = {
	onClose: PropTypes.func,
	promotionsData: PropTypes.object,
};

export default PromotionCard;
