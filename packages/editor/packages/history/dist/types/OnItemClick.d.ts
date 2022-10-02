import React from 'react';
import { Item } from './Item';
export declare type OnItemClick = (e: React.MouseEvent<HTMLElement>, args: {
    id: Item['id'];
}) => void;
