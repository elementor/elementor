import {Panel} from "@editor/ui-panel";
import {HistoryPanel, Item} from "@editor/ui-history-panel";
import {useState} from "react";

export const HistoryPanelFull = () => {
	const [ items, setItems ] = useState<Item[]>( [
		{
			id: 3,
			title: 'Title 3',
			subTitle: 'Sub Title 3',
			action: 'Action 3',
			status: 'applied',
		},
		{
			id: 2,
			title: 'Title 2',
			subTitle: 'Sub Title 2',
			action: 'Action 2',
			status: 'not_applied',
		},
		{
			id: 1,
			title: 'Title 1',
			subTitle: 'Sub Title 1',
			action: 'Action 1',
			status: 'not_applied',
		},
	] );

	const [ currentItem, setCurrentItem ] = useState<number>( 1 );

	const onItemClick = ( id: Item['id'] ) => {
		const itemIndex = items.findIndex( ( item ) => item.id === id );

		setCurrentItem( itemIndex );

		setItems( ( prevItems ) => {
			return prevItems.map( ( item, index ) => {
				const isApplied = index < itemIndex;

				return {
					...item,
					status: isApplied ? 'applied' : 'not_applied',
				};
			} );
		} );
	};

	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: '800px',
			height: '100vh',
		}}>
			<Panel>
				<div style={{
					padding: '20px',
				}}>
					<HistoryPanel items={ items } currentItem={ currentItem } onItemClick={ ( e, args ) => {
						// eslint-disable-next-line no-console
						console.log( 'Apply item: ', {
							id: args.id,
						} );

						onItemClick( args.id );
					} } />
				</div>
			</Panel>
		</div>
	);
}
