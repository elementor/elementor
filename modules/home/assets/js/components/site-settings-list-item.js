import ListItem from '@elementor/ui/ListItem';
import { Box } from '@elementor/ui';
import ListItemText from '@elementor/ui/ListItemText';
import Link from '@elementor/ui/Link';

const SiteSettingsListItem = ( { item, image } ) => {
	return (
		<ListItem alignItems="flex-start" sx={ { gap: 1, p: 0, maxWidth: '150px' } }>
			<Box component="img" src={ image }></Box>
			<Box>
				<ListItemText primary={ item.title } primaryTypographyProps={ { variant: 'subtitle1' } } sx={ { my: 0 } } />
				<Link variant="body2" color="text.tertiary" underline="hover" href={ item.url } target="_blank">{ item.title_small }</Link>
			</Box>
		</ListItem>
	);
};

export default SiteSettingsListItem;

SiteSettingsListItem.propTypes = {
	item: PropTypes.shape( {
		title: PropTypes.string.isRequired,
		title_small: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
	} ).isRequired,
	image: PropTypes.string,
};
