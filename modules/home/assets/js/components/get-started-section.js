import { Box, Paper, Typography } from '@elementor/ui';
import List from '@elementor/ui/List';
import ListItem from '@elementor/ui/ListItem';
import ListItemText from '@elementor/ui/ListItemText';

const GetStarted = ( { ...props } ) => {
	console.log(props);
	return (
		<Paper elevation={ 0 } sx={ { p: 3 } }>
			<Typography variant="h6">{ props.getStartedData.header.title }</Typography>
			<List>
				{
					props.getStartedData.repeater.map( ( item, index ) => {
						return (
							<ListItem key={ index } sx={ { p: 0, gap: 1 } }>
								<Box component="img" src={ props.getStartedData.header.image }></Box>
								<ListItemText variant="body2">{ item.title }</ListItemText>
							</ListItem>
						);
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
