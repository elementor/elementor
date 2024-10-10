import Card from '@elementor/ui/Card';
import CardHeader from '@elementor/ui/CardHeader';
import Chip from '@elementor/ui/Chip';
import CardMedia from '@elementor/ui/CardMedia';
import CardContent from '@elementor/ui/CardContent';
import Typography from '@elementor/ui/Typography';
import CardActions from '@elementor/ui/CardActions';
import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';

const PromotionCard = () => {
	return (
		<Card sx={ { maxWidth: 300 } }>
			<CardHeader title={
				<Box sx={ { display: 'flex', gap: 1 } }>
					<>Bring Headlines to Life</>
					<Chip size="small" label="pro" variant="outlined" color="promotion" />
				</Box>
			} />
			<CardMedia
				image="https://assets.elementor.com/free-to-pro-upsell/v1/images/animated-headline.jpg"
				sx={ { height: 190, width: 296 } }
			/>
			<CardContent>
				<Typography variant="body2" color="text.secondary" component="p">
					promo text...
				</Typography>
			</CardContent>
			<CardActions>
				<Button variant="contained" size="small" color="promotion">Upgrade Now</Button>
			</CardActions>
		</Card>
	);
};

export default PromotionCard;
