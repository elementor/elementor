type PromptHistoryMeta = {
	totalItems: number
	itemCount: number
	itemsPerPage: number
	totalPages: number
	currentPage: number
	allowedDays: number
}

export type PromptHistoryItem = {
	elementorApiId: string
	url: string
	type: string
	action: string
	request: {
		prompt: string
	}
	response: {
		results: {
			text: string
		}
	}
	createdAt: string
	isFavorite: boolean
}

type PromptHistoryPaginationData = {
	items: PromptHistoryItem[]
	meta: PromptHistoryMeta
}

export type PromptHistoryResponseData = {
	success: boolean
	code: number
	data: PromptHistoryPaginationData | string | any[]
}
