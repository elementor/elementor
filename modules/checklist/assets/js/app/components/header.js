import { Typography, CloseButton, AppBar, Divider, Toolbar } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import Progress from './progress';
import PropTypes from 'prop-types';
import { useQuery } from '@elementor/query';
import * as React from 'react';
import { toggleChecklistPopup } from '../../utils/functions';
import { USER_PROGRESS } from '../../utils/consts';

const { CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME } = USER_PROGRESS;

const fetchStatus = async () => {
	const response = await $e.data.get( 'checklist/user-progress', {}, { refresh: true } );

	return response?.data?.data?.[ CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME ] || false;
};

const Header = ( { steps } ) => {
	const { data: closedForFirstTime } = useQuery( {
		queryKey: [ 'closedForFirstTime' ],
		queryFn: fetchStatus,
	} );

	const closeChecklist = async () => {
		if ( ! closedForFirstTime ) {
			await $e.data.update( 'checklist/user-progress', {
				[ CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME ]: true,
			} );

			window.dispatchEvent( new CustomEvent( 'elementor/checklist/first_close', { detail: { message: 'firstClose' } } ) );
		}

		toggleChecklistPopup();
	};

	return (
		<>
			<AppBar
				elevation={ 0 }
				position="sticky"
				sx={ { p: 2, backgroundColor: 'background.default' } }
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
					<CloseButton onClick={ closeChecklist } />
				</Toolbar>
				<Progress steps={ steps } />
			</AppBar>
			<Divider />
		</>
	);
};

Header.propTypes = {
	steps: PropTypes.array.isRequired,
};

export default Header;

