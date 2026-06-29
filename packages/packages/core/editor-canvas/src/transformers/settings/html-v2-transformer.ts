import { createTransformer } from '../create-transformer';

type HtmlV2Value = {
	content: string | null;
	children: Record< string, unknown >;
};

export const htmlV2Transformer = createTransformer( ( value: HtmlV2Value ) => {
	return value?.content ?? '';
} );
