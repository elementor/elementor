import { Box } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function Footer( props ) {
	const {
		children,
		sx = {},
		...rest
	} = props;

	return (
		<Box
			component="footer"
			sx={ {
				mt: 'auto',
				py: 2,
				px: 3,
				borderTop: 1,
				borderColor: 'divider',
				display: 'flex',
				justifyContent: 'flex-end',
				alignItems: 'center',
				...sx,
			} }
			{ ...rest }
		>
			{ children }
		</Box>
	);
}

Footer.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};
