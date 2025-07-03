import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

import { stylesRepository } from '../styles-repository';
import { type UserCapabilities } from '../types';

type UserCan = {
	[ key in keyof UserCapabilities ]: boolean;
};

const DEFAULT_CAPABILITIES: UserCan = {
	create: true,
	delete: true,
	update: true,
	updateProps: true,
};

export const useUserStylesCapability = () => {
	const { capabilities } = useCurrentUserCapabilities();

	const userCan = ( providerKey: string ): UserCan => {
		const provider = stylesRepository.getProviderByKey( providerKey );

		if ( ! provider?.capabilities ) {
			return DEFAULT_CAPABILITIES;
		}

		return Object.entries( provider.capabilities ).reduce(
			( acc, [ key, capability ] ) => ( {
				...acc,
				[ key ]: capabilities?.includes( capability ) ?? true,
			} ),
			DEFAULT_CAPABILITIES
		);
	};

	return { userCan };
};
