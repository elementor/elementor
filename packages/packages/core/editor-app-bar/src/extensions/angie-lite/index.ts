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
                // featuredMcpServer: "demo-help-center",
                promptLibrary: { enabled: false },
                fileUpload: { enabled: false },
                modeSwitcher: { enabled: false, default: 'ask' },
                // localServers: { skipLoading: true },
                "title": "Ask Angie",
                "subtitle": "Ask questions, learn how features work, and get help with Elementor.",
                "suggestions": {
                  "items": [
                    {
                      "label": "How to use Atomic tabs",
                      "value": "How to use Atomic tabs?"
                    },
                    {
                      "label": "How to create design system",
                      "value": "How to style my site using v4 design system - global classes and variables?"
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
