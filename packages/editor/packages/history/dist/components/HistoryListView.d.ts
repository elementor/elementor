import { Item, OnItemClick } from '../types';
import React from 'react';
declare type Props = {
    items: Item[];
    currentItem?: number;
    onItemClick?: OnItemClick;
};
declare const HistoryListView: React.VFC<Props>;
export default HistoryListView;
