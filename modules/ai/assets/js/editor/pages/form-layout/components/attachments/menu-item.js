import { Box, Stack, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

export const MenuItem = ( props ) => {
	const IconComponent = props.icon;
	return (
		<Stack
			direction="row"
			spacing={ 1 }
			sx={ {
				cursor: 'pointer',
				alignItems: 'center',
				p: 2,
			} }
			variant="body2"
			onClick={ props.onClick }
		>
			<Box
				sx={ {
					height: 18,
				} }
			>
				<IconComponent
					sx={ {
						me: 1,
					} }
				/>
			</Box>
			<Typography>
				{ props.title }
			</Typography>
		</Stack>
	);
};

MenuItem.propTypes = {
	title: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	icon: PropTypes.elementType,
};
