import { Paper } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import PropTypes from 'prop-types';

const HeaderSection = ( props ) => {
	return (
		<Paper
			elevation={ 0 }
			sx={ {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				pt: 2.5,
			} }
		>
			<Typography variant="h5">
				Home
			</Typography>
			<Button
				variant="contained"
				size="medium"
				color="primary"
				href={ props.editWebsiteUrl }
				target="_blank"
			>
				Edit Website
			</Button>
		</Paper>
	);
};

HeaderSection.propTypes = {
	editWebsiteUrl: PropTypes.string.isRequired,
};

export default HeaderSection;

