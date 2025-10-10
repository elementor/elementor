import { createTransformer } from '../create-transformer';

type Link = {
	destination: string | number;
	isTargetBlank: boolean;
};

export const linkTransformer = createTransformer( ( { destination, isTargetBlank }: Link ) => {
	return {
		// The real post URL is not relevant in the Editor.
		href: typeof destination === 'number' ? '#post-id-' + destination : destination,
		target: isTargetBlank ? '_blank' : '_self',
	};
} );
