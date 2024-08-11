import Typography from '@elementor/ui/Typography';
import CloseButton from '@elementor/ui/CloseButton';
import AppBar from '@elementor/ui/AppBar';
import Divider from '@elementor/ui/Divider';
import Toolbar from '@elementor/ui/Toolbar';
import { __ } from '@wordpress/i18n';

const Header = ( props ) => {
	const { setIsOpen } = props;

	return (
		<>
			<AppBar
				elevation={ 0 }
				position="sticky"
				sx={ {
					backgroundColor: 'background.default',
					p: 2,
				} }
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
