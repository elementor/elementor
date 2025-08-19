import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import Link from '@elementor/ui/Link';
import Button from '@elementor/ui/Button';
import Card from '@elementor/ui/Card';
import CardActions from '@elementor/ui/CardActions';
import CardContent from '@elementor/ui/CardContent';
import CardMedia from '@elementor/ui/CardMedia';

const Addons = ( { ...props } ) => {
	const domain = props.adminUrl.replace( 'wp-admin/', '' );
	const addonsArray = props.addonsData.repeater;
	const cardsPerRow = 3 === addonsArray.length ? 3 : 2;

	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Box>
				<Typography variant="h6">{ props.addonsData.header.title }</Typography>
				<Typography variant="body2" color="text.secondary">{ props.addonsData.header.description }</Typography>
			</Box>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: `repeat(${ cardsPerRow }, 1fr)`, xs: 'repeat(1, 1fr)' }, gap: 2 } }>
				{
					addonsArray.map( ( item ) => {
						const linkTarget = item.hasOwnProperty( 'target' ) ? item.target : '_blank';

						return (
							<Card key={ item.title } elevation={ 0 } sx={ { display: 'flex', border: 1, borderRadius: 1, borderColor: 'action.focus' } }>
								<CardContent sx={ { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3, p: 3 } }>
									<Box>
										<CardMedia image={ item.image } sx={ { height: '58px', width: '58px', mb: 2 } } />
										<Box>
											<Typography variant="subtitle2">{ item.title }</Typography>
											<Typography variant="body2" color="text.secondary">{ item.description }</Typography>
										</Box>
									</Box>
									<CardActions sx={ { p: 0 } }>
										<Button variant="outlined" size="small" color="promotion" href={ item.url } target={ linkTarget }>{ item.button_label }</Button>
									</CardActions>
								</CardContent>
							</Card>
						);
					} )
				}
			</List>
			<Link variant="body2" color="info.main" underline="none" href={ `${ domain }${ props.addonsData.footer.file_path }` }>{ props.addonsData.footer.label }</Link>
		</Paper>
	);
};

export default Addons;

Addons.propTypes = {
	addonsData: PropTypes.object.isRequired,
	adminUrl: PropTypes.string.isRequired,
};
