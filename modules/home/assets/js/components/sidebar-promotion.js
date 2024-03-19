import { Box, Paper, Typography, Stack } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import ListItemText from '@elementor/ui/ListItemText';
import SideBarCheckIcon from '../icons/side-bar-check-icon';

const SideBarPromotion = ( { ...props } ) => {
	return (
		<Paper elevation={ 0 } sx={ { p: 3 } }>
			<Stack gap={ 1.5 } sx={ { alignItems: 'center', textAlign: 'center', pb: 4 } }>
				<Box component="img" src={ props.sideData.header.image } sx={ { width: '130px' } }></Box>
				<Box>
					<Typography variant="h6">{ props.sideData.header.title }</Typography>
					<Typography variant="body2" color="text.secondary">{ props.sideData.header.description }</Typography>
				</Box>
				<Button variant="contained" size="medium" color="promotion" href={ props.sideData.cta.url } startIcon={ <Box component="img" src={ props.sideData.cta.image } sx={ { width: '16px' } }></Box> } target="_blank" sx={ { maxWidth: 'fit-content' } }>{ props.sideData.cta.label }</Button>
			</Stack>
			<List>
				{
					props.sideData.repeater.map( ( item, index ) => {
						return (
							<ListItem key={ index } sx={ { p: 0, gap: 1 } }>
								<SideBarCheckIcon />
								<ListItemText variant="body2">{ item.title }</ListItemText>
							</ListItem>
						);
					} )
				}
			</List>
		</Paper>
	);
};

export default SideBarPromotion;

SideBarPromotion.propTypes = {
	sideData: PropTypes.object.isRequired,
};
