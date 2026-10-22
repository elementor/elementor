import { useState } from 'react';
import { XIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Checkbox from '@elementor/ui/Checkbox';
import CircularProgress from '@elementor/ui/CircularProgress';
import Dialog from '@elementor/ui/Dialog';
import FormControlLabel from '@elementor/ui/FormControlLabel';
import IconButton from '@elementor/ui/IconButton';
import Link from '@elementor/ui/Link';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { installAngiePlugin } from '../../api';
import { openAngieAfterInstall } from '../open-angie';

const WP_ADMIN_BAR_Z_INDEX = 99999;
const DIALOG_Z_INDEX = WP_ADMIN_BAR_Z_INDEX + 1;
const DIALOG_WIDTH = 889;
const HERO_WIDTH = 434;
const INSTALL_SPINNER_SIZE = 18;
const ANGIE_TERMS_URL = 'https://elementor.com/terms/angie-terms-conditions/';
const ANGIE_PRIVACY_URL = 'https://elementor.com/about/privacy/';

export const AngieInstallDialog = ( { check, heroUrl, angieAppUrl, angiePluginSearchUrl, onClose, onCopyPrompt } ) => {
	const [ agreedToTerms, setAgreedToTerms ] = useState( false );
	const [ isInstalling, setIsInstalling ] = useState( false );
	const [ installFailed, setInstallFailed ] = useState( false );

	const handleClose = () => {
		if ( isInstalling ) {
			return;
		}

		onClose();
	};

	const handleInstall = async () => {
		setIsInstalling( true );
		setInstallFailed( false );

		const result = await installAngiePlugin();

		if ( ! result.success ) {
			setIsInstalling( false );
			setInstallFailed( true );
			return;
		}

		openAngieAfterInstall( check.fixPrompt, angieAppUrl );
	};

	return (
		<Dialog
			open
			onClose={ handleClose }
			sx={ { zIndex: DIALOG_Z_INDEX } }
			PaperProps={ {
				sx: {
					width: DIALOG_WIDTH,
					maxWidth: 'calc(100% - 32px)',
					m: 0,
					overflow: 'hidden',
				},
			} }
		>
			<Stack direction="row" alignItems="stretch">
				<Box
					component="img"
					src={ heroUrl }
					alt=""
					width={ HERO_WIDTH }
					sx={ { objectFit: 'cover', flexShrink: 0, display: { xs: 'none', md: 'block' } } }
				/>
				<Stack flex={ 1 } minWidth={ 0 } justifyContent="space-between">
					<Stack direction="row" justifyContent="flex-end" px={ 1 } pt={ 1 }>
						<IconButton aria-label={ __( 'Close', 'elementor' ) } onClick={ handleClose } disabled={ isInstalling }>
							<XIcon />
						</IconButton>
					</Stack>
					<Stack spacing={ 2 } px={ 3 } pb={ 2 }>
						<Typography variant="h4" component="h2" color="text.secondary">
							{ __( 'Prepare your site for agents (with Angie)', 'elementor' ) }
						</Typography>
						<Typography variant="subtitle2">
							{ installFailed
								? __( 'We couldn\'t install Angie automatically. Install it from the plugin directory instead.', 'elementor' )
								: __( 'Angie, agentic AI for WordPress, can fix this issue directly on your site. Install and activate Angie once to get started.', 'elementor' ) }
						</Typography>
						{ ! installFailed && (
							<FormControlLabel
								control={ (
									<Checkbox
										size="small"
										checked={ agreedToTerms }
										onChange={ ( event ) => setAgreedToTerms( event.target.checked ) }
									/>
								) }
								label={ (
									<Typography variant="body2" color="text.secondary">
										{ __( 'By installing, you agree to our', 'elementor' ) }
										{ ' ' }
										<Link href={ ANGIE_TERMS_URL } target="_blank" rel="noreferrer">{ __( 'Terms', 'elementor' ) }</Link>
										{ ' & ' }
										<Link href={ ANGIE_PRIVACY_URL } target="_blank" rel="noreferrer">{ __( 'Privacy Policy', 'elementor' ) }</Link>
										.
									</Typography>
								) }
							/>
						) }
					</Stack>
					<Stack direction="row" alignItems="center" justifyContent="space-between" px={ 1 } pb={ 3 } pt={ 1 }>
						<Button variant="text" color="secondary" onClick={ () => onCopyPrompt( check ) } disabled={ isInstalling } sx={ { textAlign: 'left' } }>
							{ __( 'Not now?', 'elementor' ) }
							<br />
							<Box component="span" sx={ { textDecoration: 'underline' } }>{ __( 'Copy the prompt instead', 'elementor' ) }</Box>
						</Button>
						{ installFailed ? (
							<Button variant="contained" color="primary" href={ angiePluginSearchUrl }>
								{ __( 'Install manually', 'elementor' ) }
							</Button>
						) : (
							<Button
								variant="contained"
								color="primary"
								disabled={ ! agreedToTerms || isInstalling }
								onClick={ handleInstall }
								startIcon={ isInstalling ? <CircularProgress size={ INSTALL_SPINNER_SIZE } color="inherit" /> : undefined }
							>
								{ isInstalling ? __( 'Installing…', 'elementor' ) : __( 'Install Angie & fix issue', 'elementor' ) }
							</Button>
						) }
					</Stack>
				</Stack>
			</Stack>
		</Dialog>
	);
};

AngieInstallDialog.propTypes = {
	check: PropTypes.object.isRequired,
	heroUrl: PropTypes.string.isRequired,
	angieAppUrl: PropTypes.string.isRequired,
	angiePluginSearchUrl: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	onCopyPrompt: PropTypes.func.isRequired,
};
