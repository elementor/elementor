import { AxiosError } from '@elementor/http-client';

export function getMcpErrorMessage( error: unknown, toolName: string ): string {
	if ( error instanceof AxiosError ) {
		const data = error.response?.data as { message?: string; code?: string } | undefined;
		if ( data?.message ) {
			return data.code ? `${ data.code }: ${ data.message }` : data.message;
		}
	}

	if ( error instanceof Error ) {
		return error.message;
	}

	return `${ toolName } failed with an unknown error.`;
}
