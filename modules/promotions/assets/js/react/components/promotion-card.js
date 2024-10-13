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
import ListItem from '@elementor/ui/ListItem'
import CloseButton from '@elementor/ui/CloseButton';

const PromotionCard = ( { promotionsData } ) => {
	const title = promotionsData?.title;
	const description = promotionsData?.description;
	const imgSrc = promotionsData?.image;
	const ctaText = promotionsData?.upgrade_text;
	const ctaUrl = promotionsData?.upgrade_url;

	const redirectHandler = () => {
		return window.open( ctaUrl, '_blank' );
	};

	return (
		<Card sx={ { maxWidth: 300 } }>
			<CardHeader title={
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
					<>{ title }</>
					<Chip size="small" label="pro" variant="outlined" color="promotion" sx={ { textTransform: 'uppercase' } } />
					<CloseButton/>
				</Box>
			} />
			<CardMedia
				image={ imgSrc }
				sx={ { height: 190, width: 296 } }
			/>
			<CardContent>
				<List>
					{description.map( e => { return (
						<ListItem>
							{e}
						</ListItem>
						)
					})}
				</List>
			</CardContent>
			<CardActions>
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
	promotionsData: PropTypes.object,
};

export default PromotionCard;
