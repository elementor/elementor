import { AppBar, Divider, IconButton, Toolbar, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { XIcon } from '../icons/x-icon';

export const WhatsNewTopBar = ( props ) => {
	const { setIsOpen } = props;

	return (
		<>
			<AppBar
				elevation={ 0 }
				position="sticky"
				sx={ {
					backgroundColor: 'background.default',
				} }
			>
				<Toolbar
					variant="dense"
				>
					<Typography
						variant="overline"
						sx={ { flexGrow: 1 } }
					>
						{ __( 'What\'s New', 'elementor' ) }
					</Typography>
					<IconButton
						aria-label={ 'close' }
						size="small"
						onClick={ () => setIsOpen( false ) }
					>
						<XIcon />
					</IconButton>
				</Toolbar>
			</AppBar>
			<Divider />
		</>
	);
};

WhatsNewTopBar.propTypes = {
	setIsOpen: PropTypes.func.isRequired,
};
