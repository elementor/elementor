import { List } from '@elementor/ui';
import CheckListItem from './checklist-item';
import { steps } from '../data/steps';
function CheckList() {
	return (
		<List>
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
