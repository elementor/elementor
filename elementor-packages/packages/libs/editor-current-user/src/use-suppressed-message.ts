import { useCurrentUser } from './use-current-user';
import { useUpdateCurrentUser } from './use-update-current-user';

export const useSuppressedMessage = ( messageKey: string ) => {
	const { data } = useCurrentUser();
	const { mutate } = useUpdateCurrentUser();

	const isMessageSuppressed = !! data?.suppressedMessages.includes( messageKey );

	const suppressMessage = () => {
		if ( ! isMessageSuppressed ) {
			mutate( {
				suppressedMessages: [ ...( data?.suppressedMessages ?? [] ), messageKey ],
			} );
		}
	};

	return [ isMessageSuppressed, suppressMessage ] as const;
};
