import { ThemeProvider } from 'styled-components';

export default function Theme( props ) {
	const data = { ...props };

	// Removing the children property for not appearing in the theme object.
	delete data.children;

	return (
		<ThemeProvider theme={ data }>
			{ props.children }
		</ThemeProvider>
	);
}

Theme.propTypes = {
	children: PropTypes.any,
};
