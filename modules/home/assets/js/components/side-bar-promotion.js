import { Box, Paper, Typography, Button } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import ListItemButton from '@elementor/ui/ListItemButton';
import ListItemIcon from '@elementor/ui/ListItemIcon';
import ListItemText from '@elementor/ui/ListItemText';
import YoutubeIcon from "../icons/youtube-icon";
import TopSection from "./top-section";

const PromotionBar = ( { ...props } ) => {
	return (
		<Paper>
			<Box component="image"></Box>
			<Typography variant="h6">Get Unlimited Elements Pro</Typography>
			<Typography variant="body2">Unlock access to all our widgets
				and features</Typography>
			<Button variant="contained" size="medium" href={ 'https://go.elementor.com/go-pro-home-sidebar-upgrade/' } startIcon={ <YoutubeIcon /> } target="_blank">Upgrade to Pro</Button>
			<List>

			</List>
		</Paper>
	);
};

export default PromotionBar;

PromotionBar.propTypes = {
	topData: PropTypes.object.isRequired,
};
