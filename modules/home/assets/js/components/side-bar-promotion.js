import { Box, Paper, Typography, Stack } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import ListItemIcon from '@elementor/ui/ListItemIcon';
import ListItemText from '@elementor/ui/ListItemText';
import SideBarIcon from "../icons/side-bar-cta-icon";

const PromotionBar = ( { ...props } ) => {
	return (
		<Paper elevation={ 0 } sx={ { py: { xs: 3, md: 3 }, px: { xs: 3, md: 4 }, gap: 2 } }>
			<Stack gap={ 1 } sx={ { alignItems: 'center' } }>
				<Box component="img" src={ props.sideData.header.image } sx={ { width: '35%' } }></Box>
				<Typography variant="h6">{ props.sideData.header.title }</Typography>
				<Typography variant="body2">{ props.sideData.header.description }</Typography>
				<Button variant="contained" size="medium" color="promotion" href={ props.sideData.cta.url } startIcon={ <SideBarIcon url={ props.sideData.cta.image } /> } target="_blank" sx={ { maxWidth: 'fit-content' } }>{ props.sideData.cta.label }</Button>
			</Stack>
			<List>
				{
					props.sideData.repeater.map( ( item, index ) => {
						return (
							<ListItem key={ index }>
								<ListItemIcon>
									<Box component="image" src={ item.icon }></Box>
								</ListItemIcon>
								<ListItemText variant="body2">{ item.title }</ListItemText>
							</ListItem>
								)
						},
					)
				}
			</List>
		</Paper>
	);
};

export default PromotionBar;

PromotionBar.propTypes = {
	sideData: PropTypes.object.isRequired,
};
