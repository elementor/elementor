import { parseEnv } from '@elementor/env';

export const { env } = parseEnv< {
	base_url: string;
	headers: Record< string, string >;
} >( '@elementor/http-client' );
