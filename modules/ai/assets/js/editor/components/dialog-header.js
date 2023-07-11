import { DialogTitle, Stack, SvgIcon, Typography, IconButton, styled } from '@elementor/ui';
import { XIcon } from '@elementor/icons';
import StyledChip from './ui/styled-chip';

const ElementorLogo = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props }>
			<path fillRule="evenodd" clipRule="evenodd" d="M2.69648 24.8891C0.938383 22.2579 0 19.1645 0 16C0 11.7566 1.68571 7.68687 4.68629 4.68629C7.68687 1.68571 11.7566 0 16 0C19.1645 0 22.2579 0.938383 24.8891 2.69648C27.5203 4.45459 29.5711 6.95344 30.7821 9.87706C31.9931 12.8007 32.3099 16.0177 31.6926 19.1214C31.0752 22.2251 29.5514 25.0761 27.3137 27.3137C25.0761 29.5514 22.2251 31.0752 19.1214 31.6926C16.0177 32.3099 12.8007 31.9931 9.87706 30.7821C6.95344 29.5711 4.45459 27.5203 2.69648 24.8891ZM12.0006 9.33281H9.33437V22.6665H12.0006V9.33281ZM22.6657 9.33281H14.6669V11.9991H22.6657V9.33281ZM22.6657 14.6654H14.6669V17.3316H22.6657V14.6654ZM22.6657 20.0003H14.6669V22.6665H22.6657V20.0003Z" />
		</SvgIcon>
	);
};

const StyledElementorLogo = styled( ElementorLogo )( ( { theme } ) => ( {
	width: theme.sizing[ '400' ],
	height: theme.sizing[ '400' ],
	'& path': {
		fill: theme.palette.text.primary,
	},
} ) );

const DialogHeader = ( props ) => {
	return (
		<DialogTitle component="div" sx={ { fontWeight: 'normal' } }>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Stack direction="row" spacing={ 3 } alignItems="center">
					<StyledElementorLogo />

					<Typography variant="h6" sx={ { color: 'text.primary' } }>
						{ __( 'AI', 'elementor' ) }
					</Typography>

					<StyledChip label={ __( 'Beta', 'elementor' ) } color="default" />
				</Stack>

				<Stack direction="row" spacing={ 3 } alignItems="center">
					{ props.children }

					<IconButton aria-label="close" onClick={ props.onClose } sx={ { '&.MuiButtonBase-root': { mr: -4 } } }>
						<XIcon />
					</IconButton>
				</Stack>
			</Stack>
		</DialogTitle>
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
