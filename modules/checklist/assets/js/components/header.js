import { Typography, CloseButton, AppBar, Divider, Toolbar } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import Progress from './progress';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Header = ( { steps } ) => {
	let closedForFirstTime;
	const fetchStatus = async () => {
		const response = await fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/user_progress`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': elementorWebCliConfig.nonce,
			},
		} );
		const data = await response.json();
		closedForFirstTime = await data.data.first_closed_checklist_in_editor;
		console.log(closedForFirstTime);
		return closedForFirstTime;
	};




	useEffect( () => {
		return (fetchStatus);

	}, [] );

	const closeChecklist = async() => {

			await fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/user_progress`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': elementorWebCliConfig.nonce,
				},
				body: JSON.stringify( { first_closed_checklist_in_editor: true } ),
			} );

		$e.run( 'checklist/toggle-popup' );
	};

	return (
		<>
			<AppBar
				elevation={ 0 }
				position="sticky"
				color="transparent"
				sx={ { p: 2 } }
			>
				<Toolbar
					variant="dense"
					disableGutters={ true }
				>
					<Typography
						variant="subtitle1"
						sx={ { flexGrow: 1 } }
					>
						{ __( 'Let\'s make a productivity boost', 'elementor' ) }
					</Typography>
					<CloseButton onClick={ closeChecklist } className="e-checklist-close" />
				</Toolbar>
				<Progress steps={ steps } />
			</AppBar>
			<Divider />
		</>
	);
};

export default Header;

Header.propTypes = {
	steps: PropTypes.array.isRequired,
};
