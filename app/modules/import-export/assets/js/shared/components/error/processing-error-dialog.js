import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Link as ElementorUiLink,
	Typography,
} from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

function Link( {
	href,
	children,
} ) {
	return (
		<ElementorUiLink
			href={ href }
			variant="body2"
			color="info.light"
			underline="hover"
			target="_blank"
			rel="noopener noreferrer"
		>
			{ children }
		</ElementorUiLink>
	);
}

Link.propTypes = {
	href: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export const messagesContent = {
	general: {
		title: __( 'Unable to download the Website Template', 'elementor' ),
		text: <>
			{ __( 'We couldn’t download the Website Template due to technical difficulties on our part. Try again and if the problem persists contact ', 'elementor' ) }
			<Link href="https://my.elementor.com/support-center/">
				{ __( 'Support', 'elementor' ) }
			</Link>
		</>,
	},
	'zip-archive-module-missing': {
		title: __( 'Couldn’t handle the Website Template', 'elementor' ),
		text: __( 'Seems like your server is missing the PHP zip module. Install it on your server or contact your site host for further instructions.', 'elementor' ),
	},
	'invalid-zip-file': {
		title: __( 'Couldn’t use the .zip file', 'elementor' ),
		text: <>
			{ __( 'Seems like there is a problem with the zip’s files. Try installing again and if the problem persists contact ', 'elementor' ) }
			<Link href="https://my.elementor.com/support-center/">
				{ __( 'Support', 'elementor' ) }
			</Link>
		</>,
	},
	timeout: {
		title: __( 'Unable to download the Website Template', 'elementor' ),
		text: (
			<>
				{ __( 'It took too much time to download your Website Template and we were unable to complete the process. If all the Website Template’s parts don’t appear in ', 'elementor' ) }
				<Link href={ elementorAppConfig.pages_url } >
					{ __( 'Pages', 'elementor' ) }
				</Link>
				{ __( ', try again and if the problem persists contact ', 'elementor' ) }
				<Link href="https://my.elementor.com/support-center/">
					{ __( 'Support', 'elementor' ) }
				</Link>
			</>
		),
	},
	'invalid-kit-library-zip-error': {
		title: __( 'Unable to download the Website Template', 'elementor' ),
		text: <>
			{ __( 'We couldn’t download the Website Template due to technical difficulty on our part. Try again in a few minutes and if the problem persists contact ', 'elementor' ) }
			<Link href="https://my.elementor.com/support-center/" >
				{ __( 'Support', 'elementor' ) }
			</Link>
		</>,
	},
	'no-write-permissions': {
		title: __( 'Couldn’t access the file', 'elementor' ),
		text: __( 'Seems like Elementor isn’t authorized to access relevant files for installing this Website Template. Contact your site host to get permission.', 'elementor' ),
	},
	'plugin-installation-permissions-error': {
		title: __( 'Couldn’t install the Website Template', 'elementor' ),
		text: __( 'The Website Template includes plugins you don’t have permission to install. Contact your site admin to change your permissions.', 'elementor' ),
	},
	'third-party-error': {
		title: __( 'Unable to download the Website Template', 'elementor' ),
		text: __( 'This is due to a conflict with one or more third-party plugins already active on your site. Try disabling them, and then give the download another go.', 'elementor' ),
	},
	'domdocument-missing': {
		title: __( 'Unable to download the Website Template', 'elementor' ),
		text: __( 'This download requires the \'DOMDocument\' PHP extension, which we couldn’t detect on your server. Enable this extension, or get in touch with your hosting service for support, and then give the download another go.', 'elementor' ),
	},
	'insufficient-quota': {
		title: __( 'Couldn’t Export the Website Template', 'elementor' ),
		text: (
			<>
				{ __( 'The export failed because it will pass the maximum Website Templates you can export. ', 'elementor' ) }
				<Link href="https://go.elementor.com/app-general-load-issue/" >
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</>
		),
	},
	'failed-to-fetch-quota': {
		title: __( 'Couldn’t fetch quota', 'elementor' ),
		text: (
			<>
				{ __( 'Failed to fetch quota, please try again. If the problem continues, contact ', 'elementor' ) }
				<Link href="https://my.elementor.com/support-center/">
					{ __( 'Support', 'elementor' ) }
				</Link>
				{ '. ' }
				<Link href="https://go.elementor.com/app-import-export-common-errors" >
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</>
		),
	},
	'cloud-upload-failed': {
		title: __( 'Couldn’t Upload to Library', 'elementor' ),
		text: (
			<>
				{ __( 'We couldn’t add your export to the library. Try again. ', 'elementor' ) }
				<Link href="https://go.elementor.com/app-import-export-common-errors" >
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</>
		),
	},
	'error-loading-resource': {
		title: __( 'Unable to download the Website Template', 'elementor' ),
		text: (
			<>
				{ __( 'We couldn’t download the Website Template due to technical difficulties on our part. Try again and if the problem persists contact ', 'elementor' ) }
				<Link href="https://my.elementor.com/support-center/">
					{ __( 'Support', 'elementor' ) }
				</Link>
				{ '. ' }
				<Link href="https://go.elementor.com/app-import-export-common-errors" >
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</>
		),
	},
	'media-processing-error': {
		title: __( 'Couldn’t save media files to the cloud', 'elementor' ),
		text: (
			<>
				{ __( 'We ran into a problem while saving your media files to the cloud. Please try again. If the issue persists, edit the Content section and choose "Link to media" to save it as a reference. ', 'elementor' ) }
				<Link href="https://go.elementor.com/app-import-export-common-errors">
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</>
		),
	},
	'insufficient-storage-quota': {
		title: __( 'Your library is full', 'elementor' ),
		text: ( { filename = __( 'This file', 'elementor' ), maxSize = 0 } = {} ) => (
			<>
				<Typography variant="h6" sx={ { mb: 2 } }>
					{ sprintf( /* Translators: %s: File name */
						__( '%s exceeds the library size limit', 'elementor' ),
						filename,
					) }
				</Typography>
				<Typography variant="body2">
					{ sprintf( /* Translators: %s: Quota threshold in GB */
						__( 'The maximum website template library size is %s GB. To save this file, you can either export it locally as a .zip file or get more storage by ', 'elementor' ),
						maxSize,
					) }
					<Link href="https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/">
						{ __( 'Upgrade now', 'elementor' ) }
					</Link>
					.
				</Typography>
			</>
		),
	},
};

export function ProcessingErrorDialog( {
	error,
	handleClose,
	handleTryAgain,
	handleExportAsZip,
} ) {
	const [ open, setOpen ] = useState( Boolean( error ) );
	const errorType = error?.code || 'general';
	const errorMessageContent = messagesContent[ errorType ] ?? messagesContent.general;

	const resolveText = () => {
		const details = error?.details || error?.message;
		const replacements = details && 'object' === typeof details ? details.replacements : null;

		const text = errorMessageContent.text;

		if ( 'function' === typeof text ) {
			return text( replacements );
		}

		return text;
	};

	const shouldRenderTryAgainButton = () => {
		return [
			'general',
			'timeout',
			'cloud-upload-failed',
			'third-party-error',
			'invalid-zip-file',
			'zip-archive-module-missing',
			'no-write-permissions',
			'plugin-installation-permissions-error',
			'failed-to-fetch-quota',
			'insufficient-quota',
			'error-loading-resource',
			'media-processing-error',
			'import-runner-error',
		].includes( errorType );
	};

	const renderButtons = () => {
		const isQuotaError = 'insufficient-storage-quota' === errorType;

		return (
			<>
				<Button
					onClick={ () => {
						if ( handleClose ) {
							handleClose();
						}
						setOpen( false );
					} }
					color="secondary"
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				{ isQuotaError && handleExportAsZip && (
					<Button
						onClick={ () => {
							handleExportAsZip();
							setOpen( false );
						} }
						variant="contained"
						color="primary"
					>
						{ __( 'Export as .zip', 'elementor' ) }
					</Button>
				) }
				{ shouldRenderTryAgainButton( errorType ) && ! isQuotaError && (
					<Button
						data-testid="try-again-button"
						onClick={ () => {
							if ( handleTryAgain ) {
								handleTryAgain();
							}
						} }
						variant="contained"
						color="primary"
					>
						{ __( 'Try Again', 'elementor' ) }
					</Button>
				) }
			</>
		);
	};

	useEffect( () => {
		setOpen( Boolean( error ) );
	}, [ error ] );

	if ( ! error ) {
		return null;
	}

	return (
		<Dialog
			data-testid="error-dialog"
			open={ open }
			onClose={ () => {
				if ( handleClose ) {
					handleClose();
				}
				setOpen( false );
			} }
			maxWidth="sm"
		>
			<DialogHeader onClose={ handleClose }>
				<DialogTitle>
					{ errorMessageContent.title }
				</DialogTitle>
			</DialogHeader>

			<DialogContent dividers sx={ { p: 3 } }>
				{ resolveText() }
			</DialogContent>

			<DialogActions>
				{ renderButtons() }
			</DialogActions>
		</Dialog>
	);
}

ProcessingErrorDialog.propTypes = {
	error: PropTypes.any,
	handleClose: PropTypes.func,
	handleTryAgain: PropTypes.func,
	handleExportAsZip: PropTypes.func,
};
