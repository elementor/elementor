import PropTypes from 'prop-types';
import { Typography, CloseButton, AppBar, Divider, Toolbar } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const Header = ( props ) => {
	const { setIsOpen } = props;

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
					<CloseButton onClick={ () => setIsOpen( false ) } />
				</Toolbar>
			</AppBar>
			<Divider />
		</>
	);
};

export default Header;

Header.propTypes = {
	setIsOpen: PropTypes.func,
};
