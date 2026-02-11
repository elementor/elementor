import { settingsTransformersRegistry } from './settings-transformers-registry';
import { attributesTransformer } from './transformers/settings/attributes-transformer';
import { createClassesTransformer } from './transformers/settings/classes-transformer';
import { dateTimeTransformer } from './transformers/settings/date-time-transformer';
import { linkTransformer } from './transformers/settings/link-transformer';
import { queryTransformer } from './transformers/settings/query-transformer';
import { imageSrcTransformer } from './transformers/shared/image-src-transformer';
import { imageTransformer } from './transformers/shared/image-transformer';
import { plainTransformer } from './transformers/shared/plain-transformer';
import { videoSrcTransformer } from './transformers/shared/video-src-transformer';

export function initSettingsTransformers() {
	settingsTransformersRegistry
		.register( 'classes', createClassesTransformer() )
		.register( 'link', linkTransformer )
		.register( 'query', queryTransformer )
		.register( 'image', imageTransformer )
		.register( 'image-src', imageSrcTransformer )
		.register( 'video-src', videoSrcTransformer )
		.register( 'attributes', attributesTransformer )
		.register( 'date-time', dateTimeTransformer )
		.registerFallback( plainTransformer );
}
