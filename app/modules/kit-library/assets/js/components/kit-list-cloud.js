import { useCallback, useState } from 'react';
import Kit from '../models/kit';
import KitListCloudItem from './kit-list-cloud-item';
import { CssGrid } from '@elementor/app-ui';
import { useKitCloudMutations } from '../hooks/use-kit-cloud-mutation';
import KitCloudDeleteDialog from './kit-cloud-delete-dialog';

export default function KitListCloud( props ) {
	const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState( false );
	const { remove, isLoading } = useKitCloudMutations();
	const [ kit, setKit ] = useState();

	const resetKit = useCallback( () => {
		setKit( null );
		setIsDeleteModalOpen( false );
	}, [] );

	const handleDelete = useCallback( async () => {
		try {
			await remove.mutate( kit.id );
		} finally {
			resetKit();
		}
	}, [ kit, remove, resetKit ] );

	return (
		<CssGrid spacing={ 24 } colMinWidth={ 290 }>
			<>
				{
					props.data.map( ( model, index ) => (
						<KitListCloudItem
							key={ model.id }
							model={ model }
							index={ index }
							source={ props.source }
							onDelete={ () => {
								setKit( model );
								setIsDeleteModalOpen( true );
							} }
						/>
					) )
				}
			</>
			<KitCloudDeleteDialog
				kit={ kit }
				show={ isDeleteModalOpen }
				onDeleteClick={ handleDelete }
				onCancelClick={ resetKit }
				isLoading={ isLoading }
			/>
		</CssGrid>
	);
}

KitListCloud.propTypes = {
	data: PropTypes.arrayOf( PropTypes.instanceOf( Kit ) ),
	source: PropTypes.string,
};
