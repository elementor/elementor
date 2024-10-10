import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import Infotip from '@elementor/ui/Infotip';
import Chip from '@elementor/ui/Chip';
import Button from '@elementor/ui/Button';
import Card from '@elementor/ui/Card';
import CardHeader from '@elementor/ui/CardHeader';
import CardMedia from '@elementor/ui/CardMedia';
import CardContent from '@elementor/ui/CardContent';
import CardActions from '@elementor/ui/CardActions';
import Typography from '@elementor/ui/Typography';

const InfoTipCard = () => {
	return (
		<Card sx={ { maxWidth: 300 } }>
			<CardHeader title={
				<>
					Bring Headlines to Life
					<Chip size="small" label="pro" variant="outlined" color="promotion" />
				</>
			} />
			<CardMedia
				image="https://elementor.com/cdn-cgi/image/f=auto,w=1100,h=840/marketing/wp-content/uploads/2022/10/IMG-3-2-1.png"
				sx={ { height: 190 } }
			/>
			<CardContent>
				<Typography>promo text...</Typography>
			</CardContent>
			<CardActions>
				<Button variant="contained">Upgrade Now</Button>
			</CardActions>
		</Card>
	);
}

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<Infotip
						placement="right"
						arrow={ true }
						open={ true }
						content={ <InfoTipCard /> }
						onClose={ props.onClose }
					>
					</Infotip>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
};

export default App;
