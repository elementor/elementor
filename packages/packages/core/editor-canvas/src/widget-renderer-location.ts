import { type ComponentType } from 'react';
import { type Root } from 'react-dom/client';

type JQueryElement = {
	on: ( event: string, selector: string, handler: ( event: Event ) => void ) => void;
	off: ( event: string, selector: string ) => void;
};

export type WidgetRendererProps = {
	widgetType: string;
	container: unknown;
	el: HTMLElement;
	model: unknown;
	onUnmount: () => void;
	reactRoot: Root;
};

/**
 * Defines when and how to trigger the custom renderer mount.
 * Receives the widget's jQuery element and a mount callback.
 *
 * Example - trigger on double-click:
 * ```
 * const trigger: MountTrigger = ({ $el, mount }) => {
 *   $el.on('dblclick', '*', () => mount());
 * };
 * ```
 */
export type MountTrigger = ( args: {
	$el: JQueryElement;
	mount: () => void;
} ) => void;

type WidgetRendererRegistration = {
	id: string;
	component: ComponentType< WidgetRendererProps >;
	condition: ( props: { widgetType: string } ) => boolean;
	mountTrigger?: MountTrigger;
};

/**
 * Widget Renderer Registry
 *
 * Allows registering custom React components to replace the default rendering
 * for specific widget types on the canvas (editor view only, not visitor view).
 *
 * Use cases:
 * - Inline editing (e.g., heading, text)
 * - Interactive previews (e.g., form builders)
 * - Custom editor experiences (e.g., drag-and-drop interfaces)
 *
 * Usage:
 * ```
 * widgetRendererRegistry.register({
 *   id: 'my-custom-renderer',
 *   condition: ({ widgetType }) => widgetType === 'my-widget',
 *   component: MyCustomComponent,
 *   mountTrigger: ({ $el, mount }) => $el.on('click', '*', mount)
 * });
 * ```
 */
function createWidgetRendererRegistry() {
	const registrations = new Map< string, WidgetRendererRegistration >();

	return {
		register( registration: WidgetRendererRegistration ) {
			registrations.set( registration.id, registration );
		},
		getRegistrations() {
			return Array.from( registrations.values() );
		},
	};
}

export const widgetRendererRegistry = createWidgetRendererRegistry();

