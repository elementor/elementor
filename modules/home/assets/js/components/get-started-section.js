import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItemText from '@elementor/ui/ListItemText';
import ListItemButton from '@elementor/ui/ListItemButton';
import Link from '@elementor/ui/Link';

const GetStarted = ( { ...props } ) => {
	// Will be replaced with a backend solution
	const adminUrl = elementorAppConfig.admin_url;
	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Typography variant="h6">{ props.getStartedData.header.title }</Typography>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', xs: 'repeat(2, 1fr)' }, gap: { md: 9, xs: 7 } } }>
				{
					props.getStartedData.repeater.map( ( item, index ) => {
						return (
							<ListItemButton key={ index } alignItems="flex-start" href={ `${ adminUrl }${ item.file_path }` } target="_blank" sx={ { gap: 1, p: 0, '&:hover': { backgroundColor: 'initial' }, maxWidth: '150px' } }>
								<Box component="img" src={ props.getStartedData.header.image } sx={ { pt: 0.5 } }></Box>
								<Box>
									<ListItemText primary={ item.title } primaryTypographyProps={ { variant: 'subtitle1' } } sx={ { my: 0 } } />
									<Link variant="body2" color="text.tertiary" underline="hover">{ item.title_small }</Link>
								</Box>
							</ListItemButton>
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
