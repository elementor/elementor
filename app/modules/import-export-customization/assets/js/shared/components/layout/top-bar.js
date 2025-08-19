import { AppBar, Toolbar, Divider } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function TopBar( props ) {
	const {
		children,
		sx = {},
		...rest
	} = props;

	return (
		<>
			<AppBar
				position="static"
				elevation={ 0 }
				sx={ {
					backgroundColor: 'background.default',
					...sx,
				} }
				{ ...rest }
			>
				<Toolbar
					sx={ {
						minHeight: { xs: 56, sm: 64 },
						px: 3,
						justifyContent: 'space-between',
					} }
				>
					{ children }
				</Toolbar>
			</AppBar>
			<Divider />
		</>
	);
}

TopBar.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};
