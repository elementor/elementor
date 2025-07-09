import { Button, Box, Typography, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Link, styled, SvgIcon } from '@elementor/ui';
import { useState } from 'react';
import PropTypes from 'prop-types';

import { XIcon } from '../icons';

const ElementorLogo = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props }>
			<path fillRule="evenodd" clipRule="evenodd" d="M2.69648 24.8891C0.938383 22.2579 0 19.1645 0 16C0 11.7566 1.68571 7.68687 4.68629 4.68629C7.68687 1.68571 11.7566 0 16 0C19.1645 0 22.2579 0.938383 24.8891 2.69648C27.5203 4.45459 29.5711 6.95344 30.7821 9.87706C31.9931 12.8007 32.3099 16.0177 31.6926 19.1214C31.0752 22.2251 29.5514 25.0761 27.3137 27.3137C25.0761 29.5514 22.2251 31.0752 19.1214 31.6926C16.0177 32.3099 12.8007 31.9931 9.87706 30.7821C6.95344 29.5711 4.45459 27.5203 2.69648 24.8891ZM12.0006 9.33281H9.33437V22.6665H12.0006V9.33281ZM22.6657 9.33281H14.6669V11.9991H22.6657V9.33281ZM22.6657 14.6654H14.6669V17.3316H22.6657V14.6654ZM22.6657 20.0003H14.6669V22.6665H22.6657V20.0003Z" />
		</SvgIcon>
	);
};

const StyledElementorLogo = styled( ElementorLogo )( ( { theme } ) => ( {
	width: theme.spacing( 4 ),
	height: theme.spacing( 4 ),
	'& path': {
		fill: theme.palette.text.primary,
	},
} ) );

export default function PageHeader( { title = __( 'Export', 'elementor' ) } ) {
	const [ isHelpModalOpen, setIsHelpModalOpen ] = useState( false );

	const handleClose = () => {
		window.top.location = elementorAppConfig.admin_url + 'admin.php?page=elementor-tools';
	};

	const handleHelpClick = () => {
		setIsHelpModalOpen( true );
	};

	const handleHelpModalClose = () => {
		setIsHelpModalOpen( false );
	};

	return (
		<>
			<Stack direction="row" spacing={ 2 } alignItems="center">
				<StyledElementorLogo sx={ { mr: 1 } } />
				<Typography
					variant="h6"
					component="h1"
					color="text.primary"
					sx={ {
						fontWeight: 600,
					} }
				>
					{ title }
				</Typography>
			</Stack>

			<Stack direction="row" spacing={ 1 } alignItems="center">
				<IconButton
					onClick={ handleHelpClick }
					aria-label={ __( 'Help', 'elementor' ) }
				>
					<Box component="i" className="eicon-info-circle" />
				</IconButton>
				<IconButton
					onClick={ handleClose }
					aria-label={ __( 'Close', 'elementor' ) }
				>
					<XIcon />
				</IconButton>
			</Stack>

			<Dialog
				open={ isHelpModalOpen }
				onClose={ handleHelpModalClose }
				maxWidth="sm"
			>
				<DialogTitle>
					{ __( 'Export a Website Template', 'elementor' ) }
				</DialogTitle>
				<DialogContent>
					<Box sx={ { mb: 3 } }>
						<Typography variant="h6" gutterBottom>
							{ __( "What's a Website Template?", 'elementor' ) }
						</Typography>
						<Typography variant="body2" color="text.secondary" paragraph>
							{ __( 'A Website Template is a .zip file that contains all the parts of a complete site. It\'s an easy way to get a site up and running quickly.', 'elementor' ) }
						</Typography>
						<Link
							href="https://go.elementor.com/app-what-are-kits"
							target="_blank"
							variant="body2"
						>
							{ __( 'Learn more about Website Templates', 'elementor' ) }
						</Link>
					</Box>

					<Box>
						<Typography variant="h6" gutterBottom>
							{ __( 'How does exporting work?', 'elementor' ) }
						</Typography>
						<Typography variant="body2" color="text.secondary" paragraph>
							{ __( 'To turn your site into a Website Template, select the templates, content, settings and plugins you want to include. Once it\'s ready, you\'ll get a .zip file that you can import to other sites.', 'elementor' ) }
						</Typography>
						<Link
							href="https://go.elementor.com/app-export-kit"
							target="_blank"
							variant="body2"
						>
							{ __( 'Learn More', 'elementor' ) }
						</Link>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={ handleHelpModalClose }>
						{ __( 'Close', 'elementor' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

PageHeader.propTypes = {
	title: PropTypes.string,
};
