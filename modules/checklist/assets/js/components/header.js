import Typography  from '@elementor/ui/Typography';
import XIcon from '@elementor/icons/XIcon';
import { AppBar, Divider, IconButton, Toolbar } from "@elementor/ui";
import { __ } from "@wordpress/i18n";

const Header = ( props ) => {
	const { isOpen, setIsOpen } = props;

	return (
	<>
		<AppBar
			elevation={ 0 }
			position="sticky"
			sx={ {
				backgroundColor: 'background.default',
				p:2
			} }
		>
			<Toolbar
				variant="dense"
				disableGutters="true"
			>
				<Typography
					variant="subtitle1"
					sx={ { flexGrow: 1 } }
				>
					{ __( 'Let\'s make a productivity boost', 'elementor' ) }
				</Typography>
				<IconButton
					aria-label={ 'close' }
					size="small"
					onClick={ () => {

						setIsOpen( false )
						console.log( isOpen )
					} }
					sx={ { p: 1 } }
				>
					<XIcon />
				</IconButton>
			</Toolbar>
		</AppBar>
		<Divider />
	</>

	);
}

export default Header;
