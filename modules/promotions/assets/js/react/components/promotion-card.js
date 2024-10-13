import {
	Card,
	CardHeader,
	Chip,
	CardMedia,
	CardContent,
	Typography,
	CardActions,
	Button,
	Box,
	CloseButton,
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
		<Card sx={ { width: 296 } }>
			<CardHeader title={
				<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
					<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
						<Typography variant="subtitle2">{ title }</Typography>
						<Chip size="small" label="pro" variant="outlined" color="promotion" sx={ { textTransform: 'uppercase' } } />
					</Box>
					<CloseButton edge="end" slotProps={ {
						icon: {
							fontSize: 'small',
						},
					} } onClose={ onClose } />
				</Box>
			} sx={ { py: 1 } } />
			<CardMedia
				image={ imgSrc }
				sx={ { height: 150 } }
			/>
			<CardContent>
				{ description.map( ( e, index ) => {
					return ( <Typography key={ index } variant="body2" color="secondary">&bull; { e }</Typography> );
				} ) }
			</CardContent>
			<CardActions sx={ { pt: 1 } }>
				<Button
					variant="contained"
					size="small"
					color="promotion"
					onClick={ redirectHandler }
				>{ ctaText }</Button>
			</CardActions>
		</Card>
	);
};

PromotionCard.propTypes = {
	onClose: PropTypes.func,
	promotionsData: PropTypes.object,
};

export default PromotionCard;
