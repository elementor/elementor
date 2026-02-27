import { createTransformer } from '../create-transformer';

type HtmlV3Value = {
	content: string | null;
	children: unknown[];
};

export const htmlV3Transformer = createTransformer( ( value: HtmlV3Value ) => {
	return value?.content ?? '';
} );
