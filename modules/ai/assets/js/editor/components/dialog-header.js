import { AppBar, Toolbar, Stack, SvgIcon, IconButton, Chip, Typography, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { XIcon } from '@elementor/icons';

const ElementorLogo = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props }>
			<path fillRule="evenodd" clipRule="evenodd" d="M2.69648 24.8891C0.938383 22.2579 0 19.1645 0 16C0 11.7566 1.68571 7.68687 4.68629 4.68629C7.68687 1.68571 11.7566 0 16 0C19.1645 0 22.2579 0.938383 24.8891 2.69648C27.5203 4.45459 29.5711 6.95344 30.7821 9.87706C31.9931 12.8007 32.3099 16.0177 31.6926 19.1214C31.0752 22.2251 29.5514 25.0761 27.3137 27.3137C25.0761 29.5514 22.2251 31.0752 19.1214 31.6926C16.0177 32.3099 12.8007 31.9931 9.87706 30.7821C6.95344 29.5711 4.45459 27.5203 2.69648 24.8891ZM12.0006 9.33281H9.33437V22.6665H12.0006V9.33281ZM22.6657 9.33281H14.6669V11.9991H22.6657V9.33281ZM22.6657 14.6654H14.6669V17.3316H22.6657V14.6654ZM22.6657 20.0003H14.6669V22.6665H22.6657V20.0003Z" />
		</SvgIcon>
	);
};

const StyledElementorLogo = styled( ElementorLogo )( ( { theme } ) => ( {
	width: theme.spacing( 3 ),
	height: theme.spacing( 3 ),
	'& path': {
		fill: theme.palette.text.primary,
	},
} ) );

const DialogHeader = ( props ) => {
	return (
		<AppBar sx={ { fontWeight: 'normal' } } color="transparent" position="relative">
			<Toolbar variant="dense">
				<StyledElementorLogo sx={ { mr: 1 } } />

				<Typography component="span" variant="subtitle2" sx={ { fontWeight: 'bold', textTransform: 'uppercase' } }>
					{ __( 'AI', 'elementor' ) }
				</Typography>

				<Chip label={ __( 'Beta', 'elementor' ) } color="default" size="small" sx={ { ml: 1 } } />

				<Stack direction="row" spacing={ 1 } alignItems="center" sx={ { ml: 'auto' } }>
					{ props.children }

					<IconButton
						size="small"
						aria-label="close"
						onClick={ props.onClose }
						sx={ { '&.MuiButtonBase-root': { mr: -1 } } }
					>
						<XIcon />
					</IconButton>
				</Stack>
			</Toolbar>
		</AppBar>
	);
};

DialogHeader.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node,
	] ),
};

export default DialogHeader;
