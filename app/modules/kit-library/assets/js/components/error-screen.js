/* eslint-disable jsx-a11y/alt-text */
import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import PropTypes from 'prop-types';

import './error-screen.scss';

const ErrorScreenButton = ( props ) => {
	const onClick = () => {
		if ( props.action ) {
			props.action();
		}
	};

	return (
		<Button
			text={ props.text }
			onClick={ onClick }
			url={ props.url }
			target={ props.target }
			color={ props.color || 'link' }
			variant={ props.variant || '' }
		/>
	);
};

ErrorScreenButton.propTypes = {
	text: PropTypes.string,
	action: PropTypes.func,
	url: PropTypes.string,
	target: PropTypes.string,
	color: PropTypes.oneOf( [ 'primary', 'secondary', 'cta', 'link', 'disabled' ] ),
	variant: PropTypes.oneOf( [ 'contained', 'underlined', 'outlined', '' ] ),
};

export default function ErrorScreen( props ) {
	return (

		<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__error-screen">
			<img src={ `${ elementorAppConfig.assets_url }images/no-search-results.svg` } />
			<Heading
				tag="h3"
				variant="display-1"
				className="e-kit-library__error-screen-title"
			>
				{ props.title }
			</Heading>
			<Text variant="xl" className="e-kit-library__error-screen-description">
				{ props.description } { ' ' }
				{ ! props.newLineButton && (
					<ErrorScreenButton { ...props.button } />
				) }
			</Text>
			{ props.newLineButton && (
				<ErrorScreenButton { ...props.button } />
			) }
		</Grid>
	);
}

ErrorScreen.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	newLineButton: PropTypes.bool,
	button: PropTypes.shape( {
		text: PropTypes.string,
		action: PropTypes.func,
		url: PropTypes.string,
		target: PropTypes.string,
		category: PropTypes.string,
		color: PropTypes.oneOf( [ 'primary', 'secondary', 'cta', 'link', 'disabled' ] ),
		variant: PropTypes.oneOf( [ 'contained', 'underlined', 'outlined', '' ] ),
	} ),
};
