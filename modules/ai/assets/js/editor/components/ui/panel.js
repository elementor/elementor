import { Box, Divider } from '@elementor/ui';
import PropTypes from 'prop-types';

const Panel = ( { sx = {}, ...props } ) => {
	return (
		<>
			<Box
				sx={ {
					p: 4,
					width: 360,
					flexShrink: 0,
					height: '100%',
					overflowY: 'auto',
					...sx,
				} }
				{ ...props }
			>
				{ props.children }
			</Box>

			<Divider orientation="vertical" />
		</>
	);
};

Panel.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};

export default Panel;
