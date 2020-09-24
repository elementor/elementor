import { ThemeProvider } from 'styled-components';

export default function Theme( props ) {
	const isDarkMode = false; // elementorAppConfig...

	return (
		<ThemeProvider theme={ isDarkMode ? props.dark : props.default }>
			{ props.children }
		</ThemeProvider>
	);
}

Theme.propTypes = {
	children: PropTypes.any,
	default: PropTypes.object.isRequired,
};

Theme.defaultProps = {
	default: {},
	dark: {},
};

