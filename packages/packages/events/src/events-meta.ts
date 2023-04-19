import {
	Interaction,
	Source,
	SystemEventMeta,
	Trigger,
	UserEventMeta,
} from './types';

export const systemEventMeta = ( args: { source: Source, trigger: Trigger } ): SystemEventMeta => {
	return {
		initiator: 'system',
		source: args.source,
		trigger: args.trigger,
	};
};

export const userEventMeta = ( args: { source: Source; interaction: Interaction } ): UserEventMeta => {
	return {
		initiator: 'user',
		source: args.source,
		interaction: args.interaction,
	};
};
