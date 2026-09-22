import Box from '@elementor/ui/Box';
import Tab from '@elementor/ui/Tab';
import Tabs from '@elementor/ui/Tabs';
import PropTypes from 'prop-types';

const TAB_PILL_RADIUS = '40px';
const TRACK_RADIUS = '32px';

const getTabSx = ( isSelected ) => ( {
	minHeight: 0,
	minWidth: 'auto',
	px: 1.5,
	py: 0.5,
	borderRadius: TAB_PILL_RADIUS,
	color: isSelected ? 'text.secondary' : 'text.disabled',
	textTransform: 'none',
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: '24px',
	letterSpacing: '0.4px',
	opacity: 1,
	border: '1px solid',
	borderColor: isSelected ? 'divider' : 'transparent',
	backgroundColor: isSelected ? 'common.white' : 'transparent',
	boxShadow: 'none',
	'&:hover': {
		backgroundColor: isSelected ? 'common.white' : 'transparent',
	},
} );

export const PillTabs = ( { value, onChange, tabs, getTabProps } ) => {
	return (
		<Box
			display="inline-flex"
			p={ 1 }
			border={ 1 }
			borderColor="divider"
			borderRadius={ TRACK_RADIUS }
			bgcolor="background.default"
			overflow="auto"
		>
			<Tabs
				value={ value }
				onChange={ onChange }
				variant="scrollable"
				scrollButtons={ false }
				sx={ {
					minHeight: 0,
					'& .MuiTabs-indicator': {
						display: 'none',
					},
					'& .MuiTabs-flexContainer': {
						gap: 0.5,
					},
				} }
			>
				{ tabs.map( ( tab ) => (
					<Tab
						key={ tab.value }
						label={ tab.label }
						{ ...getTabProps( tab.value ) }
						sx={ getTabSx( value === tab.value ) }
					/>
				) ) }
			</Tabs>
		</Box>
	);
};

PillTabs.propTypes = {
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	tabs: PropTypes.arrayOf( PropTypes.shape( {
		value: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
	} ) ).isRequired,
	getTabProps: PropTypes.func.isRequired,
};
