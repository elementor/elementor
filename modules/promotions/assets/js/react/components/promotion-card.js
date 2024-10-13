import Card from '@elementor/ui/Card';
import CardHeader from '@elementor/ui/CardHeader';
import Chip from '@elementor/ui/Chip';
import CardMedia from '@elementor/ui/CardMedia';
import CardContent from '@elementor/ui/CardContent';
import Typography from '@elementor/ui/Typography';
import CardActions from '@elementor/ui/CardActions';
import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';
import List from '@elementor/ui/List';
import ListItemText from '@elementor/ui/ListItemText';
import CloseButton from '@elementor/ui/CloseButton';

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
			<CardContent sx={ { py: 0 } }>
				<List sx={ { listStyleType: 'disc', pl: 2 } }>
					{ description.map( ( e, idx ) => {
						return ( <ListItemText key={ idx } primary={ e } primaryTypographyProps={ { variant: 'body2' } } sx={ { display: 'list-item' } } /> );
					} ) }
				</List>
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
