import { getAngieConfig } from './get-angie-config';

export const isAngieActive = async () => {
	const config = await getAngieConfig();

	return config?.status === 'active';
};
