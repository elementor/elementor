import { ArrowUpRightIcon, CopyIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Infotip from '@elementor/ui/Infotip';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useId } from 'react';

import {
	FIX_WITH_ANGIE,
	FIX_WITH_LINK,
	FIX_WITH_MANUAL,
	FIX_WITH_PREFERENCE,
	FIX_WITH_SEO,
	FIX_WITH_TOGGLE,
	VISUALLY_HIDDEN_SX,
} from '../scanner-constants';

const REASON_MAX_WIDTH = 280;

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

const CreateForMeButton = ( { check, isSaving, isDisabled, disabledReason, onSetEnabled } ) => {
	const reasonId = useId();
	const button = (
		<Button
			variant="text"
			color="inherit"
			size="small"
			disabled={ isSaving || isDisabled }
			aria-describedby={ disabledReason ? reasonId : undefined }
			onClick={ () => onSetEnabled( check, true ) }
			sx={ rowActionSx }
		>
			{ __( 'Create for me', 'elementor' ) }
		</Button>
	);

	if ( ! disabledReason ) {
		return button;
	}

	return (
		<Infotip
			arrow
			placement="top"
			content={ (
				<Box p={ 2 } maxWidth={ REASON_MAX_WIDTH } boxSizing="border-box">
					<Typography variant="body2" color="text.primary">{ disabledReason }</Typography>
				</Box>
			) }
		>
			<span style={ { display: 'inline-flex' } }>
				{ button }
				<Box component="span" id={ reasonId } sx={ VISUALLY_HIDDEN_SX }>{ disabledReason }</Box>
			</span>
		</Infotip>
	);
};

CreateForMeButton.propTypes = {
	check: PropTypes.object.isRequired,
	isSaving: PropTypes.bool,
	isDisabled: PropTypes.bool,
	disabledReason: PropTypes.string,
	onSetEnabled: PropTypes.func.isRequired,
};

export const RowAction = ( { check, isSaving = false, isToggleDisabled = false, toggleDisabledReason = null, agentAccessUrl, seoPluginSearchUrl, onOpen, onFixWithAngie, onSetEnabled } ) => {
	if ( FIX_WITH_TOGGLE === check.fixWith ) {
		return (
			<CreateForMeButton
				check={ check }
				isSaving={ isSaving }
				isDisabled={ isToggleDisabled }
				disabledReason={ toggleDisabledReason }
				onSetEnabled={ onSetEnabled }
			/>
		);
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
				{ __( 'Manual fix', 'elementor' ) }
			</Typography>
		);
	}

	return null;
};

RowAction.propTypes = {
	check: PropTypes.object.isRequired,
	isSaving: PropTypes.bool,
	isToggleDisabled: PropTypes.bool,
	toggleDisabledReason: PropTypes.string,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	onOpen: PropTypes.func.isRequired,
	onFixWithAngie: PropTypes.func.isRequired,
	onSetEnabled: PropTypes.func.isRequired,
};
