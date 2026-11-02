import { useState } from 'react';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Checkbox from '@elementor/ui/Checkbox';
import CircularProgress from '@elementor/ui/CircularProgress';
import Dialog from '@elementor/ui/Dialog';
import DialogContent from '@elementor/ui/DialogContent';
import DialogHeader from '@elementor/ui/DialogHeader';
import FormControlLabel from '@elementor/ui/FormControlLabel';
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
const HERO_WIDTH = 432;
const DIALOG_HEIGHT = 430;
const INSTALL_SPINNER_SIZE = 18;
const ANGIE_TERMS_URL = 'https://elementor.com/terms/angie-terms-conditions/';
const ANGIE_PRIVACY_URL = 'https://elementor.com/about/privacy/';

const getDescription = ( isAngieInstalled, installFailed ) => {
	if ( installFailed ) {
		return __( 'We couldn\'t install Angie automatically. Install it from the plugin directory instead.', 'elementor' );
	}

	return isAngieInstalled
		? __( 'Angie, agentic AI for WordPress, can fix this issue directly on your site. Angie is already installed, activate it once to get started.', 'elementor' )
		: __( 'Angie, agentic AI for WordPress, can fix this issue directly on your site. Install and activate Angie once to get started.', 'elementor' );
};

const getPrimaryLabel = ( isAngieInstalled, isInstalling ) => {
	if ( isAngieInstalled ) {
		return isInstalling ? __( 'Activating…', 'elementor' ) : __( 'Activate Angie & fix issue', 'elementor' );
	}

	return isInstalling ? __( 'Installing…', 'elementor' ) : __( 'Install Angie & fix issue', 'elementor' );
};

export const AngieInstallDialog = ( { check, heroUrl, angieAppUrl, angiePluginSearchUrl, isAngieInstalled = false, onClose, onCopyPrompt } ) => {
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
			<Stack direction="row" alignItems="stretch" sx={ { minHeight: DIALOG_HEIGHT } }>
				<Box
					component="img"
					src={ heroUrl }
					alt=""
					width={ HERO_WIDTH }
					sx={ { objectFit: 'cover', flexShrink: 0, display: { xs: 'none', md: 'block' } } }
				/>
				<Stack flex={ 1 } minWidth={ 0 }>
					<DialogHeader onClose={ handleClose } logo={ false } />
					<DialogContent sx={ { pt: 0 } }>
						<Stack spacing={ 2 } alignItems="flex-start">
							<Typography variant="h4" component="h2" color="text.secondary">
								{ __( 'Prepare your site for agents (with Angie)', 'elementor' ) }
							</Typography>
							<Typography variant="subtitle1" color="text.secondary">
								{ getDescription( isAngieInstalled, installFailed ) }
							</Typography>
							{ ! installFailed && (
								<FormControlLabel
									sx={ {
										m: 0,
										alignItems: 'flex-start',
										gap: 1,
										'& .MuiCheckbox-root': {
											p: 0,
											mt: 0.25,
										},
										'& .MuiFormControlLabel-label': {
											mt: 0,
										},
									} }
									control={ (
										<Checkbox
											size="small"
											checked={ agreedToTerms }
											onChange={ ( event ) => setAgreedToTerms( event.target.checked ) }
										/>
									) }
									label={ (
										<Typography variant="body2" color="text.secondary" component="span">
											{ __( 'By installing, you agree to our', 'elementor' ) }
											{ ' ' }
											<Link href={ ANGIE_TERMS_URL } target="_blank" rel="noreferrer" underline="none" color="info">{ __( 'Terms', 'elementor' ) }</Link>
											{ ' & ' }
											<Link href={ ANGIE_PRIVACY_URL } target="_blank" rel="noreferrer" underline="none" color="info">{ __( 'Privacy Policy', 'elementor' ) }</Link>
											.
										</Typography>
									) }
								/>
							) }
						</Stack>
					</DialogContent>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						px={ 3 }
						pb={ 3 }
						pt={ 1 }
					>
						<Button
							variant="text"
							color="secondary"
							onClick={ () => onCopyPrompt( check ) }
							disabled={ isInstalling }
							sx={ { textAlign: 'left' } }
						>
							<Stack alignItems="flex-start" spacing={ 0 }>
								<span>{ __( 'Not now?', 'elementor' ) }</span>
								<Box component="span" sx={ { textDecoration: 'underline' } }>{ __( 'Copy the prompt instead', 'elementor' ) }</Box>
							</Stack>
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
								{ getPrimaryLabel( isAngieInstalled, isInstalling ) }
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
	isAngieInstalled: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onCopyPrompt: PropTypes.func.isRequired,
};
