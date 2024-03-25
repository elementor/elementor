import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import Link from '@elementor/ui/Link';
import Button from '@elementor/ui/Button';
import Card from '@elementor/ui/Card';
import CardActions from '@elementor/ui/CardActions';
import CardContent from '@elementor/ui/CardContent';
import CardMedia from '@elementor/ui/CardMedia';

const Addons = ( { ...props } ) => {
	const cardsPerRow = 3 === props.addonsData.repeater.length ? 3 : 2;
	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Box>
				<Typography variant="h6">{ props.addonsData.header.title }</Typography>
				<Typography variant="body" color="text.secondary">{ props.addonsData.header.description }</Typography>
			</Box>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: `repeat(${ cardsPerRow }, 1fr)`, xs: 'repeat(1, 1fr)' }, gap: 2 } }>
				{
					props.addonsData.repeater.map( ( item ) => {
						return (
							<Card key={ item.title } elevation={ 0 } sx={ { display: 'flex', border: 1, borderRadius: 1, borderColor: 'action.focus' } }>
								<CardContent sx={ { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3 } }>
									<Box>
										<CardMedia image={ item.image } sx={ { height: '58px', width: '58px', mb: 3 } } />
										<Box>
											<Typography variant="subtitle2">{ item.title }</Typography>
											<Typography variant="body2" color="text.secondary">{ item.description }</Typography>
										</Box>
									</Box>
									<CardActions sx={ { p: 0 } }>
										<Button variant="outlined" size="small" color="promotion" href={ item.url } target="_blank" sx={ { maxWidth: 'fit-content' } }>{ item.button_label }</Button>
									</CardActions>
								</CardContent>
							</Card>
						);
					} )
				}
			</List>
			<Link variant="body2" color="info.main" underline="none">{ props.addonsData.footer.label }</Link>
		</Paper>
	);
};

export default Addons;

Addons.propTypes = {
	addonsData: PropTypes.object.isRequired,
};
