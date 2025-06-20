import { settingsTransformersRegistry } from './settings-transformers-registry';
import { createClassesTransformer } from './transformers/settings/classes-transformer';
import { linkTransformer } from './transformers/settings/link-transformer';
import { imageSrcTransformer } from './transformers/shared/image-src-transformer';
import { imageTransformer } from './transformers/shared/image-transformer';
import { plainTransformer } from './transformers/shared/plain-transformer';

export function initSettingsTransformers() {
	settingsTransformersRegistry
		.register( 'classes', createClassesTransformer() )
		.register( 'link', linkTransformer )
		.register( 'image', imageTransformer )
		.register( 'image-src', imageSrcTransformer )
		.registerFallback( plainTransformer );
}
