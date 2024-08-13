import { Typography, CloseButton, AppBar, Divider, Toolbar } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const Header = () => {
	const closeChecklist = () => {
		$e.run( 'checklist/toggle' );
	};

	return (
		<>
			<AppBar
				elevation={ 0 }
				position="sticky"
				color="transparent"
				sx={ { p: 2 } }
			>
				<Toolbar
					variant="dense"
					disableGutters={ true }
				>
					<Typography
						variant="subtitle1"
						sx={ { flexGrow: 1 } }
					>
						{ __( 'Let\'s make a productivity boost', 'elementor' ) }
					</Typography>
					<CloseButton onClick={ closeChecklist } />
				</Toolbar>
			</AppBar>
			<Divider />
		</>
	);
};

export default Header;
