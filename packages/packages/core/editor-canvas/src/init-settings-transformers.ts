import { settingsTransformersRegistry } from './settings-transformers-registry';
import { attributesTransformer } from './transformers/settings/attributes-transformer';
import { createClassesTransformer } from './transformers/settings/classes-transformer';
import { linkTransformer } from './transformers/settings/link-transformer';
import { imageSrcTransformer } from './transformers/shared/image-src-transformer';
import { imageTransformer } from './transformers/shared/image-transformer';
import { plainTransformer } from './transformers/shared/plain-transformer';
import { createServerTransformer } from './transformers/shared/server-transformer';

export function initSettingsTransformers() {
	const serverTransformer = createServerTransformer( { context: 'settings' } );

	settingsTransformersRegistry
		.register( 'classes', createClassesTransformer() )
		.register( 'link', linkTransformer )
		.register( 'image', imageTransformer )
		.register( 'image-src', imageSrcTransformer )
		.register( 'string', serverTransformer )
		.register( 'key-value-array', attributesTransformer )
		.registerFallback( plainTransformer );
}
