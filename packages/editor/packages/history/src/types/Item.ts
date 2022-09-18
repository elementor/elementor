export type ItemStatus = 'applied' | 'not_applied';

export type Item = {
	id: number,
	status: ItemStatus,
	title: string,
	subTitle?: string,
	action: string,
}
