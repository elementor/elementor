import React, { useLayoutEffect } from 'react';
import { AppBar, Grid, Box, IconButton, styled } from '@elementor/ui';
import ElementorIcon from './icons/ElementorIcon';
import PlusIcon from './icons/PlusIcon';

interface ExtendedWindow extends Window {
    $e: {
        route: ( route: string ) => void;
    };
}

const { $e } = window as unknown as ExtendedWindow;

const AppBarAction = styled( IconButton )( ( { theme } ) => ( {
    borderRadius: '8px',
    padding: theme.spacing(2),
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
} ) );

export const TopBar = () => {
    const appBarHeight = '48px';

    useLayoutEffect( () => {
        // Adjusting the editor panerl height, to consider the top-bar height;
        const style = document.createElement( 'style' );

        style.innerHTML = `#elementor-editor-wrapper {
            height: calc( 100vh - ${ appBarHeight } );
        }`;

        document.body.appendChild( style );
    }, [] );

    return (
        <AppBar position="sticky" sx={ { background: '#000', height: appBarHeight } }>
            <Grid container direction="row">
                <Box sx={ { flexGrow: 1, paddingInlineStart: '10px' } }>
                    <IconButton onClick={ () => { $e.route( 'panel/menu' ) } }>
                        <ElementorIcon />
                    </IconButton>
                    
                    <AppBarAction onClick={ () => { $e.route( 'panel/elements/categories' ) } }>
                        <PlusIcon fontSize="small" />
                    </AppBarAction>
                </Box>
            </Grid>
        </AppBar>
    );
};

export default TopBar;
