import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import GetStartedListItem from './get-started-list-item';

const GetStarted = ( { ...props } ) => {
	return (
		<Paper elevation={ 0 } sx={ { p: 3, display: 'flex', flexDirection: 'column', gap: 2 } }>
			<Typography variant="h6">{ props.getStartedData.header.title }</Typography>
			<List sx={ { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', xs: 'repeat(2, 1fr)' }, gap: { md: 9, xs: 7 } } }>
				{
					props.getStartedData.repeater.map( ( item ) => {
						return ( <GetStartedListItem key={ item.title } item={ item } image={ props.getStartedData.header.image } /> );
					} )
				}
			</List>
		</Paper>
	);
};

export default GetStarted;

GetStarted.propTypes = {
	getStartedData: PropTypes.object.isRequired,
};
