import ListItem from '@elementor/ui/ListItem';
import ListItemText from '@elementor/ui/ListItemText';
import Link from '@elementor/ui/Link';
import Box from '@elementor/ui/Box';

import CreateNewPageDialog from './create-new-page-dialog';

const GetStartedListItem = ( { item, image, hasSidebarUpgrade } ) => {
	// Will be replaced with a backend solution
	const adminUrl = elementorAppConfig.admin_url;
	const url = item.is_relative_url ? adminUrl + item.url : item.url;

	const [ isOpen, openDialog ] = React.useState( false );

	const handleLinkClick = ( event ) => {
		if ( ! item.new_page ) {
			return;
		}

		event.preventDefault();
		openDialog( true );
	};

	return (
		<ListItem alignItems="flex-start" sx={ { gap: 1, p: 0, maxWidth: '150px' } }>
			<Box component="img" src={ image }></Box>
			<Box>
				<ListItemText primary={ item.title } primaryTypographyProps={ { variant: 'subtitle1' } } sx={ { my: 0 } } />
				{ hasSidebarUpgrade
					? <Link variant="body2" color="text.tertiary" underline="hover" href={ url } target="_blank" onClick={ handleLinkClick }>{ item.title_small }</Link>
					: <Link variant="body2" color={ ( item.title_small_color ) ? item.title_small_color : 'text.tertiary' } underline="hover" href={ url } target="_blank" onClick={ handleLinkClick }>{ ( item.title_small_color ) ? 'Upgrade' : item.title_small }</Link>
				}
			</Box>

			{ item.new_page && <CreateNewPageDialog url={ url } isOpen={ isOpen } closedDialogCallback={ () => openDialog( false ) } /> }
		</ListItem>
	);
};

export default GetStartedListItem;

GetStartedListItem.propTypes = {
	item: PropTypes.shape( {
		title: PropTypes.string.isRequired,
		title_small: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		new_page: PropTypes.bool,
		is_relative_url: PropTypes.bool,
		title_small_color: PropTypes.string,
	} ).isRequired,
	hasSidebarUpgrade: PropTypes.bool,
	image: PropTypes.string,
};
