import { Button, Box, Typography, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Link } from '@elementor/ui';
import { useState } from 'react';
import PropTypes from 'prop-types';

import { XIcon } from '../icons';

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
				<Box
					component="i"
					sx={ {
						fontSize: 24,
						color: 'primary.main',
					} }
					className="eicon-elementor"
				/>
				<Typography
					variant="h6"
					component="h1"
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
					<Box component="i" className="eicon-help-o" />
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
