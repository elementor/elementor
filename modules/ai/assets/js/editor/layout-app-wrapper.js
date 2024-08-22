import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import PropTypes from 'prop-types';

const LayoutAppWrapper = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<ThemeProvider colorScheme={ props.colorScheme }>
				{ props.children }
			</ThemeProvider>
		</DirectionProvider>
	);
};

LayoutAppWrapper.propTypes = {
	children: PropTypes.node,
	isRTL: PropTypes.bool,
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
};

export default LayoutAppWrapper;
