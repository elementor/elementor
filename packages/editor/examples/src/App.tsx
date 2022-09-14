import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import './assets/eicons/css/elementor-icons.css';
import { HistoryPanel, Item } from 'history';

function App() {
	const [ items, setItems ] = useState<Item[]>( [
		{
			id: '3',
			title: 'Title 3',
			subTitle: 'Sub Title 3',
			action: 'Action 3',
			status: 'applied',
		},
		{
			id: '2',
			title: 'Title 2',
			subTitle: 'Sub Title 2',
			action: 'Action 2',
			status: 'not_applied',
		},
		{
			id: '1',
			title: 'Title 1',
			subTitle: 'Sub Title 1',
			action: 'Action 1',
			status: 'not_applied',
		},
	] );

	const [ currentItem, setCurrentItem ] = useState<number>( 1 );

	const applyItem = ( id: Item['id'] ) => {
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
	}

	return (
		<div className="App">
			<link rel="stylesheet" href="https://connect.elementor.cloud/wp-content/plugins/elementor/assets/css/editor.min.css?ver=3.8.0-cloud1" />
			{/*<link rel="stylesheet" href="https://connect.elementor.cloud/wp-content/plugins/elementor/assets/css/editor-dark-mode.min.css?ver=3.8.0-cloud1" />*/}

			<h1>With Items:</h1>
			<HistoryPanel items={ items } currentItem={ currentItem } applyItem={ ( e, args ) => {
				console.log( 'Apply item: ', {
					id: args.id,
				} );

				applyItem( args.id );
			} } />

			<div style={ { height: '100px' } } />

			<h1>Empty:</h1>
			<HistoryPanel items={ [] } currentItem={ 0 } applyItem={ () => {} } />
		</div>
	);
}

export default App;
