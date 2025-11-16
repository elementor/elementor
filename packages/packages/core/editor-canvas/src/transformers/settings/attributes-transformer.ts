import { createTransformer } from '../create-transformer';

export const attributesTransformer = createTransformer< { key: string; value: string }[] >( () => '' );
