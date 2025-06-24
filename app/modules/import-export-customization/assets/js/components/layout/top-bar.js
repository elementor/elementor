import AppBar from '@elementor/ui/AppBar';
import Toolbar from '@elementor/ui/Toolbar';
import PropTypes from 'prop-types';

export default function TopBar( props ) {
	const {
		children,
		sx = {},
		...rest
	} = props;

	return (
		<AppBar
			position="static"
			elevation={ 1 }
			color="inherit"
			sx={ {
				bgcolor: 'background.default',
				color: 'text.primary',
				borderBottom: 1,
				borderColor: 'divider',
				...sx,
			} }
			{ ...rest }
		>
			<Toolbar
				sx={ {
					minHeight: { xs: 56, sm: 64 },
					px: 3,
				} }
			>
				{ children }
			</Toolbar>
		</AppBar>
	);
}

TopBar.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};
