import { __ } from '@wordpress/i18n';
import { AppBar, Grid, Box, IconButton, styled, Button } from '@elementor/ui';
import ElementorIcon from './icons/elementor-icon';
import PlusIcon from './icons/plus-icon';
import { openRoute, useIsRouteActive } from '@elementor/v1-adapters';
import { useCurrentDocument, useDocumentsActions } from '@elementor/documents';

const AppBarAction = styled( IconButton )( ( { theme } ) => ( {
	borderRadius: '8px',
	padding: theme.spacing( 2 ),
	'&:hover, &.active': {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
	},
} ) );

export const TopBar = () => {
	const isActive = useIsRouteActive( 'panel/elements' );

	const document = useCurrentDocument();
	const { save } = useDocumentsActions();

	return (
		<AppBar position="sticky" sx={ { background: '#000', height: '48px' } }>
			<Grid container direction="row">
				<Box sx={ { flexGrow: 1, paddingInlineStart: '10px' } }>
					<IconButton onClick={ () => openRoute( 'panel/menu' ) }>
						<ElementorIcon titleAccess={ __( 'Elementor Logo', 'elementor' ) } />
					</IconButton>

					<AppBarAction className={ isActive ? 'active' : '' } onClick={ () => openRoute( 'panel/elements/categories' ) }>
						<PlusIcon fontSize="small" />
					</AppBarAction>

					{
						document && (
							<div style={ { position: 'absolute', top: 'calc( ( 48px - 1em ) / 2 )', left: '50%', transform: 'translateX( -50% )' } }>
								{ document.isModified && '[*] ' }
								{ document.title }
								{ document.isSaving && ' [Saving...] ' }
								{ document.isSavingDraft && ' [Saving Draft...] ' } ({ document.status })
							</div>
						)
					}

					<Button onClick={ () => save() }>Save</Button>
				</Box>
			</Grid>
		</AppBar>
	);
};

export default TopBar;
