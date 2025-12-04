import { Box, Paper } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItemButton from '@elementor/ui/ListItemButton';
import ListItemText from '@elementor/ui/ListItemText';

const ExternalLinksSection = ( { ...props } ) => {
	return (
		<Paper elevation={ 0 } sx={ { py: 3, px: { xs: 3, md: 4 }, borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' } }>
			<List sx={ { display: 'flex', flexDirection: 'row', rowGap: 2, columnGap: 15 } }>
				{
					props.externalLinksData.map( ( item ) => {
						return (
							<Box key={ item.label } sx={ { display: 'flex', alignItems: 'center', width: 15.5 } }>
								<ListItemButton href={ item.url } target="_blank" sx={ { '&:hover': { backgroundColor: 'initial' }, gap: 2, px: 0, py: 0 } }>
									<Box component="img" src={ item.image } sx={ { width: '38px' } }></Box>
									<ListItemText sx={ { color: 'text.secondary' } } primary={ item.label } />
								</ListItemButton>
							</Box>
						);
					} )
				}
			</List>
		</Paper>
	);
};

export default ExternalLinksSection;

ExternalLinksSection.propTypes = {
	externalLinksData: PropTypes.array.isRequired,
};
