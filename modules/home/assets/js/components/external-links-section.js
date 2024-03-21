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
								<ListItemButton key={ index } href={ item.url } target="_blank" sx={ { '&:hover': { background: 'none' }, gap: 1, px: 0 } }>
									<Box component="img" src={ item.image } sx={ { width: '38px' } }></Box>
									<ListItemText variant="body1" sx={ { color: 'text.secondary' } }>{ item.label }</ListItemText>
								</ListItemButton>
								{
									index < props.externalLinksData.length - 1 && <Divider />
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
