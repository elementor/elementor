import React from 'react';

export type Item = {
	id: number,
	status: ItemStatus,
	title: string,
	subTitle?: string,
	action: string,
}

export type ItemStatus = 'applied' | 'not_applied';

export type ApplyItem = ( e : React.MouseEvent<HTMLElement>, args: { id: Item['id'] } ) => any;
