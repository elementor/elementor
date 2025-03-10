import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEntityId } from '@wordpress/core-data';
import { Button } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { WooHeaderItem } from '@woocommerce/admin-layout';

function EditWithElementorButton() {
	const [ isRedirecting, setIsRedirecting ] = useState( false );
	const productId = useEntityId( 'postType', 'product' );
	const { saveEntityRecord } = useDispatch( 'core' );

	const postStatus = useSelect( ( select ) => {
		return select( 'core' ).getEditedEntityRecord( 'postType', 'product', productId )?.status;
	}, [ productId ] );

	const isSaving = wp.data.select( 'core/editor' ).isSavingPost();

	useEffect( () => {
		if ( isRedirecting && ! isSaving ) {
			redirectToElementor();
		}
	}, [ isRedirecting, isSaving ] );

	const handleClick = () => {
		if ( 'auto-draft' === postStatus ) {
			saveEntityRecord( 'postType', 'product', {
				id: productId,
				name: `Elementor #${ productId }`,
				status: 'draft',
			} ).then( () => {
				setIsRedirecting( true );
			} ).catch( () => {} );
		} else {
			setIsRedirecting( true );
		}
	};

	const redirectToElementor = () => {
		window.location.href = getEditUrl();
	};

	const getEditUrl = () => {
		const url = new URL( ElementorWCProductEditorSettings.editLink );

		url.searchParams.set( 'post', productId );
		url.searchParams.set( 'action', 'elementor' );

		return url.toString();
	};

	return (
		<WooHeaderItem name="product">
			<Button variant="primary" onClick={ handleClick } style={ { display: 'flex', alignItems: 'center' } }>
				<i className="eicon-elementor-square" aria-hidden="true" style={ { paddingInlineEnd: '8px' } }></i>
				{ __( 'Edit with Elementor', 'elementor' ) }
			</Button>
		</WooHeaderItem>
	);
}

registerPlugin( 'elementor-header-item', {
	render: EditWithElementorButton,
	scope: 'woocommerce-product-block-editor',
} );
