import React from 'react';
import { Item } from './Item';

export type OnItemClick = ( e : React.MouseEvent<HTMLElement>, args: { id: Item['id'] } ) => any;
