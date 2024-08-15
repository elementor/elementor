const { WooHeaderItem } = wc.adminLayout;
const { useEntityId } = wp.coreData;
const { Button } = wp.components;
const { registerPlugin } = wp.plugins;
const { useDispatch, useSelect } = wp.data;

function ElementorHeaderItem() {
	const productId = useEntityId( 'postType', 'product' );
	const { saveEntityRecord } = useDispatch( 'core' );

	const postStatus = useSelect( ( select ) => {
		return select( 'core' ).getEditedEntityRecord( 'postType', 'product', productId )?.status;
	}, [ productId ] );

	const handleClick = () => {
		if ( 'auto-draft' === postStatus ) {
			saveEntityRecord( 'postType', 'product', {
				id: productId,
				name: `Elementor #${ productId }`,
				status: 'draft',
			} ).then( () => {
				redirectToElementor( productId );
			} ).catch( () => {} );
		} else {
			redirectToElementor( productId );
		}
	};

	const redirectToElementor = ( id ) => {
		const checkSaveStatus = () => {
			if ( wp.data.select( 'core/editor' ).isSavingPost() ) {
				setTimeout( checkSaveStatus, 300 );
			} else {
				window.location.href = getEditUrl( id );
			}
		};

		checkSaveStatus();
	};

	const getEditUrl = ( id ) => {
		const baseUrl = ElementorWCProductEditorSettings.editLink,
			url = new URL( baseUrl );
	
		url.searchParams.set( 'post', id );
		url.searchParams.set( 'action', 'elementor' );
	
		return url.toString();
	};

	return (
		<WooHeaderItem name="product">
			<Button variant="primary" onClick={ handleClick } style={ { display: 'flex', alignItems: 'center' } }>
				<i className="eicon-elementor-square" aria-hidden="true" style={ { paddingInlineEnd: '8px' } }></i>
				Edit with Elementor
			</Button>
		</WooHeaderItem>
	);
}

registerPlugin( 'elementor-header-item', {
	render: ElementorHeaderItem,
	scope: 'woocommerce-product-block-editor',
} );
