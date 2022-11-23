export type Notice = {
	message: string,
	action_url: string,
	action_title: string,
}

export type DocumentConfig = {
	urls: {
		preview: string,
	},
	settings: {
		settings: {
			post_title: string,
		}
	}
}
