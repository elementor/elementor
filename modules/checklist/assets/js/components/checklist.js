import { useEffect, useState } from 'react';
import { List } from '@elementor/ui';
import CheckListItem from './checklist-item';
import { useQuery, gql } from '@apollo/client';
import { GET_CHECKLIST } from '../../../graphql/queries';
function CheckList() {
	const { loading, error, data } = useQuery( GET_CHECKLIST ),
		[ steps, setSteps ] = useState( [] );

	useEffect(() => {
		if ( error ) {
			console.log( error );
		}
		setSteps( data?.checklistSteps?.edges );
	}, [ data ] );

	return (
		<div>
			{ steps &&
				<List>
					{
						steps.map( ( step, index ) => {
							return (
								<CheckListItem step={ step } key={ index } />
							);
						} )
					}
				</List>
			}
		</div>
		// <List>
		// 	{
		// 		steps.map( ( step, index ) => {
		// 			return (
		// 				<CheckListItem step={ step } key={ index } />
		// 			);
		// 		} )
		// 	}
		// </List>
	);
}

export default CheckList;
