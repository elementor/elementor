const { WooHeaderItem } = wc.adminLayout;
const { useEntityId } = wp.coreData;
const { Button } = wp.components;
const { registerPlugin } = wp.plugins;
const { useDispatch, useSelect } = wp.data;

function ElementorHeaderItem() {
    const productId = useEntityId('postType', 'product');
    const { saveEntityRecord } = useDispatch('core');

    const postStatus = useSelect((select) => {
        return select('core').getEditedEntityRecord('postType', 'product', productId)?.status;
    }, [productId]);

    const handleClick = () => {
        if (postStatus === 'auto-draft') {
            // Only update the product if it's in 'auto-draft' status
            saveEntityRecord('postType', 'product', {
                id: productId,
                name: `Elementor #${productId}`,
                status: 'draft',
            }).then(() => {
                // Call the function to handle redirection after ensuring no ongoing save operation
                redirectToElementor(productId);
            }).catch((error) => {
                console.error('Error updating product:', error);
            });
        } else {
            // Directly handle redirection if the product is not in 'auto-draft'
            redirectToElementor(productId);
        }
    };

    const redirectToElementor = (id) => {
        const checkSaveStatus = () => {
            // Check if the post is still being saved
            if (wp.data.select('core/editor').isSavingPost()) {
                // If saving is in progress, check again after a delay
                setTimeout(checkSaveStatus, 300);
            } else {
                // Redirect to Elementor when saving is complete
                window.location.href = `/wp-admin/post.php?post=${id}&action=elementor`;
            }
        };

        // Start checking the saving status
        checkSaveStatus();
    };

    return (
        <WooHeaderItem name="product">
            <Button onClick={handleClick}>
                Edit with Elementor
            </Button>
        </WooHeaderItem>
    );
}

registerPlugin('elementor-header-item', {
    render: ElementorHeaderItem,
    scope: 'woocommerce-product-block-editor',
});
