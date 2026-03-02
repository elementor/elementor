import { getSelectedElement, getWidgetsCache } from '@elementor/editor-elements';

import { isProActive } from '../../utils/is-pro-user';

type LegacyWindow = {
	$e: {
		shortcuts: {
			register: ( keys: string, config: ShortcutConfig ) => void;
		};
	};
	elementor: {
		getContainer: ( id: string ) => Container;
		$preview: Array< { getBoundingClientRect: () => DOMRect } >;
	};
};

type Container = {
	isLocked: () => boolean;
	model: {
		id: string;
		toJSON: ( options?: { remove?: string[] } ) => Record< string, unknown >;
	};
	view: {
		el: HTMLElement;
	};
};

type ShortcutConfig = {
	callback: () => void;
	dependency?: () => boolean;
	exclude?: string[];
};

export const CREATE_COMPONENT_SHORTCUT_KEYS = 'ctrl+shift+k';
const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = 'elementor/editor/open-save-as-component-form';

type CreateComponentAllowedResult =
	| { allowed: true; container: Container }
	| { allowed: false; container?: undefined };

export function isCreateComponentAllowed(): CreateComponentAllowedResult {
	const { element } = getSelectedElement();

	if ( ! element ) {
		return { allowed: false };
	}

	if ( ! isProActive() ) {
		return { allowed: false };
	}

	const widgetsCache = getWidgetsCache();
	const elementConfig = widgetsCache?.[ element.type ];

	if ( ! elementConfig?.atomic_props_schema ) {
		return { allowed: false };
	}

	const legacyWindow = window as unknown as LegacyWindow;
	const container = legacyWindow.elementor.getContainer( element.id );

	if ( ! container || container.isLocked() ) {
		return { allowed: false };
	}

	return { allowed: true, container };
}

export function triggerCreateComponentForm( container: Container ): void {
	const legacyWindow = window as unknown as LegacyWindow;
	const elementRect = container.view.el.getBoundingClientRect();
	const iframeRect = legacyWindow.elementor.$preview[ 0 ].getBoundingClientRect();

	const anchorPosition = {
		left: elementRect.left + iframeRect.left,
		top: elementRect.top + iframeRect.top,
	};

	window.dispatchEvent(
		new CustomEvent( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, {
			detail: {
				element: container.model.toJSON( { remove: [ 'default' ] } ),
				anchorPosition,
				options: {
					trigger: 'keyboard',
					location: 'canvas',
					secondaryLocation: 'canvasElement',
				},
			},
		} )
	);
}

export function initCreateComponentShortcut(): void {
	const legacyWindow = window as unknown as LegacyWindow;

	legacyWindow.$e.shortcuts.register( CREATE_COMPONENT_SHORTCUT_KEYS, {
		callback: () => {
			const result = isCreateComponentAllowed();

			if ( ! result.allowed ) {
				return;
			}

			triggerCreateComponentForm( result.container );
		},
		dependency: () => {
			const result = isCreateComponentAllowed();
			return result.allowed;
		},
		exclude: [ 'input' ],
	} );
}
