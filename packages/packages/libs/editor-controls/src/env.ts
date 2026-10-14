import { parseEnv } from '@elementor/env';

export const { env } = parseEnv< {
	background_placeholder_image: string;
} >( '@elementor/editor-controls' );
