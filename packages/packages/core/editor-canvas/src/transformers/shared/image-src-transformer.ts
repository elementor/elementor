import { createTransformer } from '../create-transformer';

type ImageSrc = {
	id?: unknown;
	url?: unknown;
	alt?: unknown;
};

export const imageSrcTransformer = createTransformer( ( value: ImageSrc ) => ( {
	id: value.id ?? null,
	url: value.url ?? null,
	alt: value.alt ?? null,
} ) );
