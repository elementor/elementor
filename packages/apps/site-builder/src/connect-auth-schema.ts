import { z } from '@elementor/schema';

export const connectAuthSchema = z.object( {
	signature: z.string().min( 1 ),
	accessToken: z.string().min( 1 ),
	clientId: z.string().min( 1 ),
	homeUrl: z.string().min( 1 ),
	siteKey: z.string().min( 1 ),
} );

export type ConnectAuth = z.infer< typeof connectAuthSchema >;

export function isValidConnectAuth( data: unknown ): data is ConnectAuth {
	return connectAuthSchema.safeParse( data ).success;
}
