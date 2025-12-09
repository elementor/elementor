import { Box, Paper, Stack, Typography } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import SideBarCheckIcon from '../../../icons/side-bar-check-icon';
import ListItemText from '@elementor/ui/ListItemText';
import { trackPromoClick, getHomeScreenPath } from '../../../utils/promo-tracking';

const SidebarDefault = ( { header, cta, repeater } ) => {
	const handleCtaClick = () => {
		trackPromoClick( header.title, cta.url, getHomeScreenPath( 'sidebar' ) );
	};

	return (
		<Paper elevation={ 0 } sx={ { p: 3 } }>
			<Box sx={ { p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' } }>
				<div><strong>DEBUG Sidebar Data:</strong></div>
				<div>header exists: { header ? 'true' : 'false' }</div>
				<div>cta exists: { cta ? 'true' : 'false' }</div>
				<div>repeater exists: { repeater ? 'true' : 'false' }</div>
				<div>repeater length: { repeater?.length || 0 }</div>
				<div>header.title: { header?.title || 'undefined' }</div>
				<div>header.image: { header?.image || 'undefined' }</div>
				<div>Full props: { JSON.stringify( { header, cta, repeater }, null, 2 ) }</div>
			</Box>
			<Stack gap={ 1.5 } alignItems="center" textAlign="center" sx={ { pb: 4 } }>
				<Box component="img" src={ header.image }></Box>
				<Box>
					<Typography variant="h6">{ header.title }</Typography>
					<Typography variant="body2" color="text.secondary">{ header.description }</Typography>
				</Box>
				<Button
					variant="contained"
					size="medium"
					color="promotion"
					href={ cta.url }
					onClick={ handleCtaClick }
					startIcon={ <Box component="img" src={ cta.image } sx={ { width: '16px' } }></Box> }
					target="_blank"
					sx={ { maxWidth: 'fit-content' } }
				>
					{ cta.label }
				</Button>
			</Stack>
			<List sx={ { p: 0 } }>
				{
					repeater.map( ( item, index ) => {
						return (
							<ListItem key={ index } sx={ { p: 0, gap: 1 } }>
								<SideBarCheckIcon />
								<ListItemText primaryTypographyProps={ { variant: 'body2' } } primary={ item.title } />
							</ListItem>
						);
					} )
				}
			</List>
		</Paper>
	);
};

export default SidebarDefault;

SidebarDefault.propTypes = {
	header: PropTypes.object.isRequired,
	cta: PropTypes.object.isRequired,
	repeater: PropTypes.array,
};
