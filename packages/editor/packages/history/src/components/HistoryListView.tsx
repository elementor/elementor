import HistoryItem from './HistoryItem';
import { Item, OnItemClick } from '../types';
import React from "react";

type Props = {
	items: Item[],
	currentItem: number,
	onItemClick: OnItemClick,
};

const HistoryListView : React.VFC<Props> = ( props ) => {
	return (
		<>
			{
				props.items.map( ( item, i ) =>
					<HistoryItem
						key={ item.id }
						item={ item }
						isCurrent={ i === props.currentItem }
						onClick={ ( e ) => props.onItemClick( e, {
							id: item.id,
						} ) }
					/>,
				)
			}
		</>
	);
}

HistoryListView.defaultProps = {
	onItemClick: () => {},
};

export default HistoryListView;
