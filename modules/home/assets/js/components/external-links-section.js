import { Box, Paper } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItemButton from '@elementor/ui/ListItemButton';
import ListItemText from '@elementor/ui/ListItemText';
import Divider from '@elementor/ui/Divider';

const ExternalLinksSection = ( { ...props } ) => {
	return (
		<Paper elevation={ 0 } sx={ { px: 3 } }>
			<List>
				{
					props.externalLinksData.map( ( item, index ) => {
						return (
							<>
								<ListItemButton key={ item.label } href={ item.url } target="_blank" sx={ { '&:hover': { backgroundColor: 'initial' }, gap: 2, px: 0, py: 2 } }>
									<Box component="img" src={ item.image } sx={ { width: '38px' } }></Box>
									<ListItemText sx={ { color: 'text.secondary' } } primary={ item.label } />
								</ListItemButton>
								{
									( index < props.externalLinksData.length - 1 ) && <Divider />
								}
							</>
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
