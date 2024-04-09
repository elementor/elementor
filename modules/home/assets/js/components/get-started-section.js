import { Paper, Typography, Box } from '@elementor/ui';
import List from '@elementor/ui/List';

import GetStartedListItem from './get-started-list-item';

const GetStarted = ( { ...props } ) => {
	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Box>
				<Typography variant="h6">{ props.getStartedData.header.title }</Typography>
				<Typography variant="body2" color="text.secondary">{ props.getStartedData.header.description }</Typography>
			</Box>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', xs: 'repeat(2, 1fr)' }, columnGap: { md: 9, xs: 7 }, rowGap: 3 } }>
				{
					props.getStartedData.repeater.map( ( item ) => {
						return ( <GetStartedListItem key={ item.title } item={ item } image={ item.image } /> );
					} )
				}
			</List>
		</Paper>
	);
};

export default GetStarted;

GetStarted.propTypes = {
	getStartedData: PropTypes.object.isRequired
};
