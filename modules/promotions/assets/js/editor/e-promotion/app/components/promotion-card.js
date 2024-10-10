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
				image="https://elementor.com/cdn-cgi/image/f=auto,w=1100,h=840/marketing/wp-content/uploads/2022/10/IMG-3-2-1.png"
				sx={ { height: 190 } }
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
