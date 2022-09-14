import HistoryItem from './HistoryItem';
import {ApplyItem, Item} from '../types/Item';
import React from "react";

type Props = {
	items: Item[],
	currentItem: number,
	onItemClick: ApplyItem,
};

const HistoryListView : React.VFC<Props> = ( props ) => {
	return (
		<>
			{
				props.items.map( ( item, i ) =>
					<HistoryItem
						key={ item.id }
						id={ item.id }
						title={ item.title }
						subTitle={ item.subTitle }
						action={ item.action }
						status={ item.status }
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
