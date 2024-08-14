import { WooHeaderItem } from '@woocommerce/admin-layout';
import { useEntityId } from '@wordpress/core-data';
import { Button } from '@wordpress/components';

const { registerPlugin } = wp.plugins;

function ElementorHeaderItem() {
    // const productId = useEntityId( 'postType', 'product' );

    return (
        <WooHeaderItem name="product">
            <Button>Edit with Elementor</Button>
        </WooHeaderItem>
    );
}

registerPlugin( 'elementor-header-item', {
    render: ElementorHeaderItem,
} );
