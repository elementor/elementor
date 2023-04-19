export type Source = string;
export type Initiator = 'system' | 'user';

/**
 * Interaction is the needed user interaction in order to trigger the event.
 */
export type Interaction = 'none' | 'hover' | 'click' | 'right-click' | 'double-click' | 'context-menu' | 'url' | 'url-hash'
	| 'drag' | 'drop' | 'typing' | 'touch' | 'wheel' | 'voice' | 'console';

export type Trigger = string;

export type EventMeta = {
	source: Source;
	initiator: Initiator
}

export type SystemEventMeta = EventMeta & {
	initiator: 'system';
	trigger: Trigger;
}

export type UserEventMeta = EventMeta & {
	initiator: 'user';
	interaction: Interaction;
}
