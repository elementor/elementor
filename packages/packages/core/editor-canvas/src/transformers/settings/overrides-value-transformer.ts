import { createTransformer } from '../create-transformer';

type ComponentValue = {
	key: string;
	value: unknown;
};

export const overridesValueTransformer = createTransformer< ComponentValue >( ( value, { overrides } ) => {
	overrides.set( value.key, value.value );

	return null;
} );
