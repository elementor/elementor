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
			<List sx={ { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', xs: 'repeat(2, 1fr)' }, alignItems: 'flex-start', gap: { xs: 3, md: 2 } } }>
				{
					props.getStartedData.repeater.map( ( item, index ) => {
						return (
							<ListItemButton key={ index } alignItems="flex-start" href={ `${ adminUrl }${ item.file_path }` } target="_blank" sx={ { gap: 0.5, p: 0, '&:hover': { background: 'none' }, minWidth: 150 } }>
								<Box component="img" src={ props.getStartedData.header.image }></Box>
								<Box>
									<ListItemText variant="subtitle1" sx={ { my: 0 } }>{ item.title }</ListItemText>
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
