import { createTransformer } from '../create-transformer';

type Query = {
	id: number;
	label: string;
};

export const queryTransformer = createTransformer( ( { id }: Query ) => {
	return id ?? null;
} );
