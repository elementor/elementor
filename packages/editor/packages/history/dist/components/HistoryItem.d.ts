import { Item, OnItemClick } from '../types';
declare type Props = {
    item: Item;
    onClick: OnItemClick;
    isCurrent: boolean;
};
declare const HistoryItem: React.VFC<Props>;
export default HistoryItem;
