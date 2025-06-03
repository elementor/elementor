import { useCallback, useState } from 'react';
import Kit from '../models/kit';
import KitListCloudItem from './kit-list-cloud-item';
import { CssGrid } from '@elementor/app-ui';
import { useKitCloudMutations } from '../hooks/use-kit-cloud-mutation';
import KitCloudDeleteDialog from './kit-cloud-delete-dialog';
import KitCloudRenameDialog from './kit-cloud-rename-dialog';

import './kit-list-cloud.scss';

export default function KitListCloud( props ) {
	const [ isDeleteModalOpen, setInDeleteModalOpen ] = useState( false );
	const [ isRenameModalOpen, setIsRenameModalOpen ] = useState( false );
	const { remove, rename, isLoading } = useKitCloudMutations();
	const [ kit, setKit ] = useState();

	const resetKit = useCallback( () => {
		setKit( null );
		setInDeleteModalOpen( false );
		setIsRenameModalOpen( false );
	}, [] );

	const handleDelete = useCallback( async () => {
		try {
			await remove.mutate( kit.id );
		} finally {
			resetKit();
		}
	}, [ kit, remove, resetKit ] );

	const handleRename = useCallback( async ( { id, title } ) => {
		try {
			await rename.mutate( { id, title } );
		} finally {
			resetKit();
		}
	}, [ rename, resetKit ] );

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
							onRemove={ () => {
								setKit( model );
								setInDeleteModalOpen( true );
							} }
							onRename={ () => {
								setKit( model );
								setIsRenameModalOpen( true );
							} }
						/>
					) )
				}
			</>
			<KitCloudDeleteDialog
				kit={ kit }
				show={ isDeleteModalOpen }
				setShow={ setInDeleteModalOpen }
				onDeleteClick={ handleDelete }
				onCancelClick={ resetKit }
				isLoading={ isLoading }
			/>
			<KitCloudRenameDialog
				kit={ kit }
				show={ isRenameModalOpen }
				setShow={ setIsRenameModalOpen }
				onConfirmClick={ handleRename }
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
