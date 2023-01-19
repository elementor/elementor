import { __ } from '@wordpress/i18n';
import { AppBar, Grid, Box, IconButton, styled } from '@elementor/ui';
import ElementorIcon from './icons/elementor-icon';
import PlusIcon from './icons/plus-icon';
import { useIsRouteActive } from '@elementor/v1-adapters';

const AppBarAction = styled( IconButton )( ( { theme } ) => ( {
	borderRadius: '8px',
	padding: theme.spacing( 2 ),
	'&:hover, &.active': {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
} ) );

export const TopBar = () => {
	const isActive = useIsRouteActive( 'panel/elements/categories' );

	return (
		<AppBar position="sticky" sx={ { background: '#000', height: '48px' } }>
			<Grid container direction="row">
				<Box sx={ { flexGrow: 1, paddingInlineStart: '10px' } }>
					<IconButton onClick={ () => {
						// @ts-ignore
						window.$e.route( 'panel/menu' );
					} }>
						<ElementorIcon titleAccess={ __( 'Elementor Logo', 'elementor' ) } />
					</IconButton>

					<AppBarAction className={ isActive ? 'active' : undefined } onClick={ () => {
						// @ts-ignore
						$e.route( 'panel/elements/categories' );
					} }>
						<PlusIcon fontSize="small" />
					</AppBarAction>
				</Box>
			</Grid>
		</AppBar>
	);
};

export default TopBar;
