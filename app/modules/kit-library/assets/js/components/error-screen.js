/* eslint-disable jsx-a11y/alt-text */
import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './error-screen.scss';

export default function ErrorScreen( props ) {
	const onClick = () => {
		appsEventTrackingDispatch(
			'kit-library/go-back-to-view-kits',
			{
				page_source: 'home page',
				element_position: 'empty state',
				category: props.button.category && ( '/favorites' === props.button.category ? 'favorites' : 'all' ),
			},
		);
		props.button.action();
	};
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
				<Button
					text={ props.button.text }
					color="link"
					onClick={ onClick }
					url={ props.button.url }
					target={ props.button.target }
				/>
			</Text>
		</Grid>
	);
}

ErrorScreen.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	button: PropTypes.shape( {
		text: PropTypes.string,
		action: PropTypes.func,
		url: PropTypes.string,
		target: PropTypes.string,
		category: PropTypes.string,
	} ),
};
