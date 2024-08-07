import List from '@elementor/ui/List';
import { steps } from '../data/steps';
import CheckListItem from './checklist-item';

function CheckList() {
	return (
		<List component="div" sx={{py:0}}>
			{
				steps.map( ( step, index ) => {
					return (
						<CheckListItem step={ step } key={ index } />
					);
				} )
			}
		</List>
	);
}

export default CheckList;
