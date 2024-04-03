import ListItem from '@elementor/ui/ListItem';
import ListItemText from '@elementor/ui/ListItemText';
import Link from '@elementor/ui/Link';
import Dialog from '@elementor/ui/Dialog';
import Button from '@elementor/ui/Button';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogContentText from '@elementor/ui/DialogContentText';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogHeaderGroup from '@elementor/ui/DialogHeaderGroup';
import DialogTitle from '@elementor/ui/DialogTitle';
import Box from '@elementor/ui/Box';
import TextField from '@elementor/ui/TextField';

const SiteSettingsListItem = ( { item, image } ) => {
	const [ open, setOpen ] = React.useState( false );
	const [ pageName, setPageName ] = React.useState( '' );

	const handlePopupOpen = ( e ) => {
		if ( ! item.new_page ) {
			return;
		}

		e.preventDefault();
		setOpen( true );
	};

	const handlePopupClose = () => setOpen( false );

	const handleChange = ( e ) => {
		const encodedPostTitle = encodeURIComponent( e.target.value );
		const postData = { post_title: encodedPostTitle };
		const urlParams = new URLSearchParams( postData );

		setPageName( urlParams.toString() );
	};

	return (
		<ListItem alignItems="flex-start" sx={ { gap: 1, p: 0, maxWidth: '150px' } }>
			<Box component="img" src={ image }></Box>
			<Box>
				<ListItemText primary={ item.title } primaryTypographyProps={ { variant: 'subtitle1' } } sx={ { my: 0 } } />
				<Link variant="body2" color="text.tertiary" underline="hover" href={ item.url } target="_blank" onClick={ handlePopupOpen }>{ item.title_small }</Link>
			</Box>

			{ item.new_page &&
				<Dialog
					open={ open }
					onClose={ handlePopupClose }
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogHeader onClose={ handlePopupClose }>
						<DialogHeaderGroup>
							<DialogTitle>{ __( 'To proceed, please name your first page', 'elementor' ) }</DialogTitle>
						</DialogHeaderGroup>
					</DialogHeader>

					<DialogContent dividers>
						<DialogContentText>({ __( 'or rename it later', 'elementor' ) })</DialogContentText>
						<TextField
							onChange={ handleChange }
						>
							<span>
								Placeholder
							</span>
						</TextField>
					</DialogContent>

					<DialogActions>
						<Button onClick={ handlePopupClose } color="primary">{ __( 'Cancel', 'elementor' ) }</Button>
						<Button onClick={ handlePopupClose } variant="contained"
							href={ pageName ? item.url + '&' + pageName : item.url }>{ __( 'Save', 'elementor' ) }</Button>
					</DialogActions>
				</Dialog> }
		</ListItem>
	);
};

export default SiteSettingsListItem;

SiteSettingsListItem.propTypes = {
	item: PropTypes.shape( {
		title: PropTypes.string.isRequired,
		title_small: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		new_page: PropTypes.bool,
	} ).isRequired,
	image: PropTypes.string,
};
