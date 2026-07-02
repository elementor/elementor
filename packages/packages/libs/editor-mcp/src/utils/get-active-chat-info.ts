export type ActiveChatInfo = {
	sessionId: string;
	expiresAt: number;
};

export const getActiveChatInfo = (): ActiveChatInfo => {
	const info = localStorage.getItem( 'angie_active_chat_id' );
	if ( ! info ) {
		return {
			expiresAt: 0,
			sessionId: '',
		};
	}
	const rawData = JSON.parse( info );
	return {
		expiresAt: rawData.expiresAt as number,
		sessionId: rawData.sessionId as string,
	};
};
