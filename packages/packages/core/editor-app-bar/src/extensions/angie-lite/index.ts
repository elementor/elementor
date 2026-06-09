import { getAngieSdk, isAngieAvailable } from '@elementor/editor-mcp';
import { toolsMenu } from '../../locations';
import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { AIIcon } from '@elementor/icons';

export function init() {
	toolsMenu.registerToggleAction( {
		id: 'toggle-angie-lite',
		priority: 4,
		useProps: useActionProps,
	} );
}

function useActionProps() {
    console.log( 'angie-lite - useActionProps' );
	const hasAngieInstalled = isAngieAvailable();

    const id = 'angie-lite-sidebar-toggle';
    useEffect( () => {
        const sdk = getAngieSdk();

        sdk.loadSidebarV2( {
            host: { appId: 'elementor' },
            container: {
                layout: 'sidebar',
                styleTheme: 'wordpress',
                chatToggleButton: {
                    enabled: true,
                    selector: `#${id}`,
                },
            },
            widgetConfig: {
                promptLibrary: { enabled: false },
                fileUpload: { enabled: false },
                modeSwitcher: { enabled: false, default: 'ask' },
                title: "What would you like to know?",
                suggestions: {
                  items: [
                    {
                      label: "What can Angie do?",
                      value: "What can Angie do?"
                    },
                    {
                      label: "How to build with Atomic elements?",
                      value: "How to build with Atomic elements?"
                    }
                  ]
                },
            }
        } );
    }, [] );

	return {
		title: __( 'Angie lite', 'elementor' ),
		icon: AIIcon,
        id,
	};
}
