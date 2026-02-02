import { settingsTransformersRegistry } from './settings-transformers-registry';
import { attributesTransformer } from './transformers/settings/attributes-transformer';
import { createClassesTransformer } from './transformers/settings/classes-transformer';
import { dateTimeTransformer } from './transformers/settings/date-time-transformer';
import { htmlV2Transformer } from './transformers/settings/html-v2-transformer';
import { linkTransformer } from './transformers/settings/link-transformer';
import { queryTransformer } from './transformers/settings/query-transformer';
import { imageSrcTransformer } from './transformers/shared/image-src-transformer';
import { imageTransformer } from './transformers/shared/image-transformer';
import { plainTransformer } from './transformers/shared/plain-transformer';

export function initSettingsTransformers() {
	settingsTransformersRegistry
		.register( 'classes', createClassesTransformer() )
		.register( 'link', linkTransformer )
		.register( 'query', queryTransformer )
		.register( 'image', imageTransformer )
		.register( 'image-src', imageSrcTransformer )
		.register( 'attributes', attributesTransformer )
		.register( 'date-time', dateTimeTransformer )
		.register( 'html-v2', htmlV2Transformer )
		.registerFallback( plainTransformer );
}
