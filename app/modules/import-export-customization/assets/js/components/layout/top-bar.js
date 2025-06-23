import AppBar from '@elementor/ui/AppBar';
import Toolbar from '@elementor/ui/Toolbar';
import Typography from '@elementor/ui/Typography';
import Box from '@elementor/ui/Box';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import PropTypes from 'prop-types';

export default function TopBar( props ) {
	const {
		title = __( 'Import/Export Customization', 'elementor' ),
		startContent,
		centerContent,
		endContent,
		showCloseButton = false,
		onClose,
		sx = {},
		...rest
	} = props;

	const handleClose = () => {
		if ( onClose ) {
			onClose();
		} else {
			window.top.location = elementorAppConfig.admin_url + 'admin.php?page=elementor-tools';
		}
	};

	return (
		<AppBar
			position="static"
			elevation={ 1 }
			color="inherit"
			sx={ {
				bgcolor: 'background.default',
				color: 'text.primary',
				borderBottom: 1,
				borderColor: 'divider',
				...sx,
			} }
			{ ...rest }
		>
			<Toolbar
				sx={ {
					justifyContent: 'space-between',
					minHeight: { xs: 56, sm: 64 },
					px: 3,
				} }
			>
				{/* Start Content */}
				<Box sx={ { display: 'flex', alignItems: 'center', flex: '0 0 auto' } }>
					{ startContent || (
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
					) }
				</Box>

				{/* Center Content */}
				<Box sx={ { display: 'flex', alignItems: 'center', flex: '1 1 auto', justifyContent: 'center' } }>
					{ centerContent }
				</Box>

				{/* End Content */}
				<Box sx={ { display: 'flex', alignItems: 'center', flex: '0 0 auto' } }>
					{ endContent }
					{ showCloseButton && (
						<IconButton
							onClick={ handleClose }
							sx={ { ml: 1 } }
							aria-label={ __( 'Close', 'elementor' ) }
						>
							<Box component="i" className="eicon-close" />
						</IconButton>
					) }
				</Box>
			</Toolbar>
		</AppBar>
	);
}

TopBar.propTypes = {
	title: PropTypes.string,
	startContent: PropTypes.node,
	centerContent: PropTypes.node,
	endContent: PropTypes.node,
	showCloseButton: PropTypes.bool,
	onClose: PropTypes.func,
	sx: PropTypes.object,
};
