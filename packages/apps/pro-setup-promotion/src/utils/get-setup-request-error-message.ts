import { AxiosError } from '@elementor/http-client';
import { __ } from '@wordpress/i18n';

type RestErrorBody = {
	message?: string;
	code?: string;
	data?: {
		message?: string;
		status?: number;
	};
};

export function getSetupRequestErrorMessage( error: unknown ): string {
	if ( error instanceof AxiosError ) {
		const data = error.response?.data as RestErrorBody | undefined;

		if ( data?.message ) {
			return data.message;
		}

		if ( data?.data?.message ) {
			return data.data.message;
		}

		if ( 500 === error.response?.status ) {
			return __(
				'Server error while setting up Pro. If this persists, use matching Core and Pro versions and check the site error log.',
				'elementor'
			);
		}
	}

	if ( error instanceof Error && error.message && ! error.message.includes( 'status code' ) ) {
		return error.message;
	}

	return __( 'Something went wrong. Please try again.', 'elementor' );
}
