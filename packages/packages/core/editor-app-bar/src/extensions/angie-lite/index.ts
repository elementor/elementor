import { getAngieSdk, isAngieAvailable } from '@elementor/editor-mcp';
import { toolsMenu } from '../../locations';
import { __ } from '@wordpress/i18n';
import { AIIcon } from '@elementor/icons';

let iAngieLiteSidebarLoaded = false;

export function init() {
	toolsMenu.registerToggleAction( {
		id: 'toggle-angie-lite',
		priority: 4,
		useProps: useActionProps,
	} );
}

function useActionProps() {
    const onClick = async () => {
      const sdk = getAngieSdk();

      if ( ! iAngieLiteSidebarLoaded ) {
        await loadAngieLiteSidebar();
      }

      await sdk.waitForReady();
      console.log( ' angie-lite - useEffect - sdk ready' );

      sdk.triggerAngie({
        context: {
          appId: 'elementor',
        },
        prompt: "Tell me about ✨Angie Lite✨"
      });
    };

	return {
		title: __( 'Angie lite', 'elementor' ),
		icon: AIIcon,
    onClick,
	};
}

const loadAngieLiteSidebar = async () => {
  console.log( ' angie-lite - loadAngieLiteSidebar' );
  const sdk = getAngieSdk();

  await sdk.loadSidebarV2( {
    host: { appId: 'elementor' },
    container: {
        layout: 'sidebar',
        styleTheme: 'wordpress',
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
  });

  iAngieLiteSidebarLoaded = true;
};
