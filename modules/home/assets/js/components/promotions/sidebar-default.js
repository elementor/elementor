import { Box, Paper, Stack, Typography } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import SideBarCheckIcon from '../../icons/side-bar-check-icon';
import ListItemText from '@elementor/ui/ListItemText';

const SidebarDefault = ( { header, cta, repeater } ) => {
	return (
		<Paper elevation={ 0 } sx={ { p: 3 } }>
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
