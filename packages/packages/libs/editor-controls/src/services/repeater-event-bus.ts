import { type ExtendedWindow, getSelectedElements } from '@elementor/editor-elements';

export class RepeaterEventBus {
	private listeners = new Map<string, Set<() => void>>();

	subscribe(eventType: string, callback: () => void) {
		if (!this.listeners.has(eventType)) {
			this.listeners.set(eventType, new Set());
		}
		this.listeners.get(eventType)!.add(callback);

		return () => {
			this.listeners.get(eventType)?.delete(callback);
		};
	}

	emit(eventType: string, data?: Record<string, any>) {
		// Call any registered callbacks
		this.listeners.get(eventType)?.forEach(callback => callback());

		// Handle specific event types with analytics tracking
		if (eventType === 'transition-item-added') {
			this.trackTransitionItemAdded(data);
		}
	}

	private trackTransitionItemAdded(data?: Record<string, any>) {
		const extendedWindow = window as unknown as ExtendedWindow;
		const config = extendedWindow?.elementorCommon?.eventsManager?.config;
		const selectedElements = getSelectedElements();
		const widgetType = selectedElements[ 0 ]?.type ?? null;

		const eventName = config?.names?.elementorEditor?.transitions?.clickAddedTransition;
		if ( config && eventName && extendedWindow.elementorCommon?.eventsManager ) {
			extendedWindow.elementorCommon.eventsManager.dispatchEvent( eventName, {
				location: config.locations.styleTabV4,
				secondaryLocation: config.secondaryLocations.transitionControl,
				trigger: config.triggers.click,
				transition_type: data?.transition_type || 'unknown',
				widget_type: widgetType,
			});
		}
	}
}

export const repeaterEventBus = new RepeaterEventBus();
