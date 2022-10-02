import React from 'react';
import { Item, OnItemClick } from '../types';
declare type Props = {
    items: Item[];
    currentItem?: number;
    onItemClick?: OnItemClick;
};
declare const HistoryPanel: React.VFC<Props>;
export default HistoryPanel;
