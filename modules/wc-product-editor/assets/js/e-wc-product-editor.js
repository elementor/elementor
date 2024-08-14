const { WooHeaderItem } = wc.adminLayout;
const { useEntityId } = wp.coreData;
const { Button } = wp.components;
const { registerPlugin } = wp.plugins;

function ElementorHeaderItem() {
    const productId = useEntityId( 'postType', 'product' );

    return (
        <WooHeaderItem name="product">
            <Button>Edit with Elementor { productId }</Button>
        </WooHeaderItem>
    );
}

registerPlugin( 'elementor-header-item', {
    render: ElementorHeaderItem,
} );
