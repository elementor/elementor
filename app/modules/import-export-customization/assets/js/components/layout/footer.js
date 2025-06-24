import { Paper } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function Footer( props ) {
	const {
		children,
		sx = {},
		elevation = 1,
		...rest
	} = props;

	return (
		<Paper
			component="footer"
			elevation={ elevation }
			sx={ {
				mt: 'auto',
				py: 2,
				px: 3,
				borderTop: 1,
				borderColor: 'divider',
				...sx,
			} }
			{ ...rest }
		>
			{ children }
		</Paper>
	);
}

Footer.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
	elevation: PropTypes.number,
};
