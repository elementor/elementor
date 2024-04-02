import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import ListItemText from '@elementor/ui/ListItemText';
import Link from '@elementor/ui/Link';

const GetStarted = ( { ...props } ) => {
	// Will be replaced with a backend solution
	const getValueMap = {
			post: () => 'post=2',
			user_id: () => 'user_id=1',
		},
		keys = Object.keys( getValueMap );

	const adminUrl = elementorAppConfig.admin_url,
		repeater = [
			{
				title: 'Site Settings',
				title_small: 'Customize',
				url: 'admin.php?page=elementor_custom_icons',
				is_relative_url: false,
				title_small_color: 'promotion.main'
			},
			{
				title: 'Site Logo',
				title_small: 'Customize',
				url: 'post.php?<post>&action=elementor&active-document=5&active_tab=settings-site-identity',
				is_relative_url: false,
				title_small_color: 'promotion.main'
			},
			{
				title: 'Global Colors',
				title_small: 'Customize',
				url: 'post.php?<post>&action=elementor&active-document=5&active_tab=global-colors',
				is_relative_url: false,
				title_small_color: 'promotion.main'
			},
			{
				title: 'Global Fonts',
				title_small: 'Customize',
				url: 'post.php?<post>&action=elementor&active-document=5&active_tab=global-fonts',
				is_relative_url: false,
				title_small_color: 'promotion.main'
			},
			{
				title: 'Custom Icons',
				title_small: 'Customize',
				url: 'admin.php?page=elementor_custom_icons',
				is_relative_url: false,
				title_small_color: 'promotion.main'
			},
			{
				title: 'Theme Builder',
				title_small: 'Customize',
				url: 'admin.php?page=elementor-app',
				is_relative_url: false,
				title_small_color: 'promotion.main'
			},
			{
				title: 'Popups',
				title_small: 'Customize',
				url: 'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup',
				is_relative_url: true,
			},
			{
				title: 'Custom Fonts',
				title_small: 'Customize',
				url: 'admin.php?page=elementor_custom_fonts',
				is_relative_url: true,
			}
		];

	const getItemHref = ( item ) => {
		return adminUrl + item.is_relative_url
			? item.url
			: item.file_path;
	};

	const replaceDynamicKeys = ( item ) => {
		const url = getItemHref( item );

		return keys.reduce( ( formattedUrl, param ) => {
			formattedUrl = formattedUrl.replace( new RegExp( `<\\s*${ param }\\s*>`, 'g' ), getValueMap[ param ]() );

			return formattedUrl;
		}, url );
	};

	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Typography variant="h6">{ props.getStartedData.header.title }</Typography>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', xs: 'repeat(2, 1fr)' }, gap: { md: 9, xs: 7 } } }>
				{ repeater.map( ( item ) => (
					<ListItem key={ item.title } alignItems="flex-start" sx={ { gap: 1, p: 0, maxWidth: '150px' } }>
						<Box component="img" src={ props.getStartedData.header.image }></Box>
						<Box>
							<ListItemText primary={ item.title } primaryTypographyProps={ { variant: 'subtitle1' } } sx={ { my: 0 } } />
							<Link variant="body2" color="text.tertiary" underline="hover" href={ replaceDynamicKeys( item ) } target="_blank">{ item.title_small }</Link>
						</Box>
					</ListItem>
				) ) }
			</List>
		</Paper>
	);
};

export default GetStarted;

GetStarted.propTypes = {
	getStartedData: PropTypes.object.isRequired,
};
