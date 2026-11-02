import { ArrowUpRightIcon, CopyIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { DisabledReasonSwitch } from '../../components/disabled-reason-switch';
import { wpAdminSwitchSx } from '../../components/wp-admin-sx';
import {
	FIX_WITH_ANGIE,
	FIX_WITH_LINK,
	FIX_WITH_MANUAL,
	FIX_WITH_PREFERENCE,
	FIX_WITH_SEO,
	FIX_WITH_TOGGLE,
	SCANNER_LAYOUT,
} from '../scanner-constants';

const rowActionSx = {
	color: 'text.primary',
	fontWeight: 500,
};

const copyWithSelection = ( text ) => {
	const textarea = document.createElement( 'textarea' );

	textarea.value = text;
	textarea.setAttribute( 'readonly', '' );
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild( textarea );
	textarea.select();

	try {
		return document.execCommand( 'copy' );
	} catch {
		return false;
	} finally {
		document.body.removeChild( textarea );
	}
};

const copyText = async ( text ) => {
	if ( ! text ) {
		return false;
	}

	const normalizedText = text.replace( /\r\n/g, '\n' );

	if ( navigator.clipboard?.writeText ) {
		try {
			await navigator.clipboard.writeText( normalizedText );

			return true;
		} catch {
			return copyWithSelection( normalizedText );
		}
	}

	return copyWithSelection( normalizedText );
};

export const CopyPromptButton = ( { onCopy } ) => (
	<Button
		className="scanner-copy-fix"
		variant="text"
		color="secondary"
		size="small"
		startIcon={ <CopyIcon fontSize="tiny" /> }
		onClick={ onCopy }
	>
		{ __( 'Copy prompt', 'elementor' ) }
	</Button>
);

CopyPromptButton.propTypes = {
	onCopy: PropTypes.func.isRequired,
};

export const copyPromptText = copyText;

const completedActionSx = {
	minWidth: 0,
	height: SCANNER_LAYOUT.completedActionHeight,
	px: '5px',
	py: '3px',
};

const CompletedActions = ( { check, isSaving = false, onUndo, onRescan } ) => (
	<Stack direction="row" alignItems="center">
		<Button variant="text" color="secondary" size="small" disabled={ isSaving } onClick={ () => onUndo( check ) } sx={ completedActionSx }>
			{ __( 'Undo', 'elementor' ) }
		</Button>
		<Button variant="text" color="inherit" size="small" disabled={ isSaving } onClick={ onRescan } sx={ { ...completedActionSx, color: 'text.primary' } }>
			{ __( 'Rescan', 'elementor' ) }
		</Button>
	</Stack>
);

CompletedActions.propTypes = {
	check: PropTypes.object.isRequired,
	isSaving: PropTypes.bool,
	onUndo: PropTypes.func.isRequired,
	onRescan: PropTypes.func.isRequired,
};

export const RowAction = ( { check, isResolved, isSaving = false, isToggleDisabled = false, toggleDisabledReason = null, agentAccessUrl, seoPluginSearchUrl, onOpen, onFixWithAngie, onSetEnabled, onUndo, onRescan } ) => {
	if ( FIX_WITH_TOGGLE === check.fixWith && ! isResolved ) {
		return (
			<DisabledReasonSwitch
				size="small"
				checked={ isResolved }
				disabled={ isSaving || isToggleDisabled }
				disabledReason={ isToggleDisabled ? toggleDisabledReason : null }
				onChange={ ( event ) => onSetEnabled( check, event.target.checked ) }
				inputProps={ { role: 'switch', 'aria-checked': isResolved, 'aria-label': check.title } }
				sx={ wpAdminSwitchSx }
			/>
		);
	}

	if ( isResolved ) {
		return <CompletedActions check={ check } isSaving={ isSaving } onUndo={ onUndo } onRescan={ onRescan } />;
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

	if ( FIX_WITH_SEO === check.fixWith ) {
		return (
			<Button variant="text" color="inherit" size="small" href={ seoPluginSearchUrl } endIcon={ <ArrowUpRightIcon fontSize="tiny" /> } sx={ rowActionSx }>
				{ __( 'Browse SEO plugins', 'elementor' ) }
			</Button>
		);
	}

	if ( FIX_WITH_MANUAL === check.fixWith ) {
		return (
			<Typography variant="body2" color="text.disabled" sx={ { fontWeight: 500, whiteSpace: 'nowrap' } }>
				{ __( 'Fix manually', 'elementor' ) }
			</Typography>
		);
	}

	return null;
};

RowAction.propTypes = {
	check: PropTypes.object.isRequired,
	isResolved: PropTypes.bool,
	isSaving: PropTypes.bool,
	isToggleDisabled: PropTypes.bool,
	toggleDisabledReason: PropTypes.string,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	onOpen: PropTypes.func.isRequired,
	onFixWithAngie: PropTypes.func.isRequired,
	onSetEnabled: PropTypes.func.isRequired,
	onUndo: PropTypes.func.isRequired,
	onRescan: PropTypes.func.isRequired,
};
