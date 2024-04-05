import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import ListItemText from '@elementor/ui/ListItemText';
import Link from '@elementor/ui/Link';
import SiteSettingsListItem from './site-settings-list-item';

const GetStarted = ( { ...props } ) => {
	// Will be replaced with a backend solution
	const adminUrl = elementorAppConfig.admin_url;

	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Typography variant="h6">{ props.getStartedData[ 0 ].header.title }</Typography>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', xs: 'repeat(2, 1fr)' }, gap: { md: 9, xs: 7 } } }>
				{
					props.getStartedData[ 0 ].repeater.map( ( item ) => {
						if ( 'site_settings' === item.type ) {
							return ( <SiteSettingsListItem key={ item.title } item={ item } image={ props.getStartedData[ 0 ].header.image } /> );
						}

						return (
							<ListItem key={ item.title } alignItems="flex-start" sx={ { gap: 1, p: 0, maxWidth: '150px' } }>
								<Box component="img" src={ props.getStartedData[ 0 ].header.image }></Box>
								<Box>
									<ListItemText primary={ item.title } primaryTypographyProps={ { variant: 'subtitle1' } } sx={ { my: 0 } } />
									<Link variant="body2" color="text.tertiary" underline="hover" href={ `${ adminUrl }${ item.file_path }` } target="_blank">{ item.title_small }</Link>
								</Box>
							</ListItem>
						);
					} )
				}
			</List>
		</Paper>
	);
};

export default GetStarted;

GetStarted.propTypes = {
	getStartedData: PropTypes.object.isRequired,
};
