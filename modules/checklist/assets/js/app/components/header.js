import { Typography, CloseButton, AppBar, Divider, Toolbar, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import Progress from './progress';
import PropTypes from 'prop-types';
import { useQuery } from '@elementor/query';
import * as React from 'react';
import { fetchUserProgress, toggleChecklistPopup, updateUserProgress } from '../../utils/functions';
import { USER_PROGRESS } from '../../utils/consts';
import { ExpandDiagonalIcon, MinimizeDiagonalIcon } from '@elementor/icons';

const { CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME } = USER_PROGRESS;

const Header = ( { steps, isMinimized, toggleIsMinimized } ) => {
	const { data: userProgress } = useQuery( {
		queryKey: [ 'closedForFirstTime' ],
		queryFn: fetchUserProgress,
	} ),
		closedForFirstTime = userProgress?.[ CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME ] || false;

	const closeChecklist = async () => {
		if ( ! closedForFirstTime ) {
			await updateUserProgress( { [ CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME ]: true } );

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
					<IconButton onClick={ toggleIsMinimized } aria-expanded={ ! isMinimized }>
						{ isMinimized ? <ExpandDiagonalIcon /> : <MinimizeDiagonalIcon /> }
					</IconButton>
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
	isMinimized: PropTypes.bool.isRequired,
	toggleIsMinimized: PropTypes.func.isRequired,
};

export default Header;

