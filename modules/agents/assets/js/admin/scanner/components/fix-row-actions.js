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
	FIX_WITH_SEO,
	FIX_WITH_TOGGLE,
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
		color="info"
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

export const RowAction = ( { check, isResolved, isSaving = false, isToggleDisabled = false, isToggleVisible = true, agentAccessUrl, seoPluginSearchUrl, onOpen, onFixWithAngie, onSetEnabled, onUndo, onRescan } ) => {
	if ( FIX_WITH_TOGGLE === check.fixWith ) {
		if ( ! isToggleVisible ) {
			return null;
		}

		return (
			<Switch
				size="small"
				checked={ isResolved }
				disabled={ isSaving || isToggleDisabled }
				onChange={ ( event ) => onSetEnabled( check, event.target.checked ) }
				inputProps={ { role: 'switch', 'aria-checked': isResolved, 'aria-label': check.title } }
				sx={ wpAdminSwitchSx }
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

	if ( FIX_WITH_SEO === check.fixWith ) {
		return (
			<Button variant="text" color="inherit" size="small" href={ seoPluginSearchUrl } endIcon={ <ArrowUpRightIcon fontSize="tiny" /> } sx={ rowActionSx }>
				{ __( 'Browse SEO plugins', 'elementor' ) }
			</Button>
		);
	}

	return null;
};

RowAction.propTypes = {
	check: PropTypes.object.isRequired,
	isResolved: PropTypes.bool,
	isSaving: PropTypes.bool,
	isToggleDisabled: PropTypes.bool,
	isToggleVisible: PropTypes.bool,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	onOpen: PropTypes.func.isRequired,
	onFixWithAngie: PropTypes.func.isRequired,
	onSetEnabled: PropTypes.func.isRequired,
	onUndo: PropTypes.func.isRequired,
	onRescan: PropTypes.func.isRequired,
};
