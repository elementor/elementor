import { createTransformer } from '../create-transformer';

type ComponentPlaceholder = {
	key: string;
	value: unknown;
};

export const overridesPlaceholderTransformer = createTransformer< ComponentPlaceholder >(
	( placeholder, { overrides } ) => {
		return overrides.get( placeholder.key ) || placeholder.value;
	}
);
