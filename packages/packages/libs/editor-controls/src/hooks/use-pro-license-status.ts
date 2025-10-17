import { useEffect, useState } from 'react';
import { httpService } from '@elementor/http-client';

export type ProLicenseStatus = { active: boolean; expired: boolean };
const STATUS_URL = 'elementor-pro/v1/license/status';

export const getProLicenseStatus = async () => {
	try {
		const res = await httpService().get< ProLicenseStatus >( STATUS_URL );
		const data = res?.data;
		return { active: data.active, expired: data.expired };
	} catch {
		return { active: false, expired: false };
	}
};

export const useProLicenseStatus = () => {
	const [ status, setStatus ] = useState< ProLicenseStatus >( { active: false, expired: false } );

	useEffect( () => {
		getProLicenseStatus().then( setStatus );
	}, [] );

	return status;
};
