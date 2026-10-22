import { ArrowUpRightIcon, CopyIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminSwitchSx } from '../../components/wp-admin-sx';
import {
	FIX_WITH_ANGIE,
	FIX_WITH_LINK,
	FIX_WITH_PREFERENCE,
	FIX_WITH_TOGGLE,
	SCANNER_COLORS,
} from '../scanner-constants';

const rowActionSx = {
	color: 'text.primary',
	fontWeight: 500,
};

const switchSx = {
	...wpAdminSwitchSx,
	'& .MuiSwitch-track': { bgcolor: SCANNER_COLORS.switchOffTrack, opacity: 1 },
	'& .Mui-checked + .MuiSwitch-track': { bgcolor: `${ SCANNER_COLORS.accent } !important`, opacity: 1 },
};

const copyText = ( text ) => {
	const clipboard = navigator.clipboard;

	if ( ! text || ! clipboard?.writeText ) {
		return;
	}

	clipboard.writeText( text ).catch( () => undefined );
};

export const CopyFixButton = ( { prompt } ) => (
	<Button
		className="scanner-copy-fix"
		variant="text"
		color="secondary"
		size="small"
		startIcon={ <CopyIcon fontSize="tiny" /> }
		onClick={ () => copyText( prompt ) }
	>
		{ __( 'Copy fix', 'elementor' ) }
	</Button>
);

CopyFixButton.propTypes = {
	prompt: PropTypes.string.isRequired,
};

const CompletedActions = ( { check, onUndo, onRescan } ) => (
	<Stack direction="row" spacing={ 1.5 } alignItems="center">
		<Button variant="text" color="secondary" size="small" onClick={ () => onUndo( check ) }>
			{ __( 'Undo', 'elementor' ) }
		</Button>
		<Button variant="text" color="primary" size="small" onClick={ onRescan }>
			{ __( 'Rescan', 'elementor' ) }
		</Button>
	</Stack>
);

CompletedActions.propTypes = {
	check: PropTypes.object.isRequired,
	onUndo: PropTypes.func.isRequired,
	onRescan: PropTypes.func.isRequired,
};

export const RowAction = ( { check, isResolved, agentAccessUrl, onOpen, onFixWithAngie, onSetEnabled, onUndo, onRescan } ) => {
	if ( FIX_WITH_TOGGLE === check.fixWith ) {
		return (
			<Switch
				size="small"
				checked={ isResolved }
				onChange={ ( event ) => onSetEnabled( check, event.target.checked ) }
				inputProps={ { role: 'switch', 'aria-checked': isResolved, 'aria-label': check.title } }
				sx={ switchSx }
			/>
		);
	}

	if ( isResolved ) {
		return <CompletedActions check={ check } onUndo={ onUndo } onRescan={ onRescan } />;
	}

	if ( FIX_WITH_ANGIE === check.fixWith ) {
		return (
			<Button variant="text" color="inherit" size="small" onClick={ () => onFixWithAngie( check ) } sx={ rowActionSx }>
				{ __( 'Fix with Angie', 'elementor' ) }
			</Button>
		);
	}

	if ( FIX_WITH_PREFERENCE === check.fixWith ) {
		return (
			<Button variant="text" color="inherit" size="small" onClick={ () => onOpen( check.id ) } sx={ rowActionSx }>
				{ __( 'Set your preference', 'elementor' ) }
			</Button>
		);
	}

	if ( FIX_WITH_LINK === check.fixWith ) {
		return (
			<Button variant="text" color="inherit" size="small" href={ check.fixUrl || agentAccessUrl } endIcon={ <ArrowUpRightIcon fontSize="tiny" /> } sx={ rowActionSx }>
				{ __( 'Open settings', 'elementor' ) }
			</Button>
		);
	}

	return null;
};

RowAction.propTypes = {
	check: PropTypes.object.isRequired,
	isResolved: PropTypes.bool,
	agentAccessUrl: PropTypes.string.isRequired,
	onOpen: PropTypes.func.isRequired,
	onFixWithAngie: PropTypes.func.isRequired,
	onSetEnabled: PropTypes.func.isRequired,
	onUndo: PropTypes.func.isRequired,
	onRescan: PropTypes.func.isRequired,
};
