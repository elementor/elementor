<?php
namespace Elementor\Data\Base\Endpoint;

/**
 * Class IndexRecursive, in cases where there no use of dynamic endpoints ( alpha/{id} )
 * when the endpoints are static, eg:
 * 'settings' - controller
 * 'settings/products' - endpoint
 * 'settings/partners' - endpoint
 * Using 'IndexRecursive', the `get_items` method of index endpoint will run all over controller endpoints, except for himself,
 * and call their `get_items` method.
 * return example:
 * [
 *  'products' => [ product items ... ],
 *  'partners' => [ partners list ... ],
 * ]
 */
class IndexRecursive extends Index {
	public function get_items( $request ) {
		return $this->controller->get_items_recursive( [ $this ] );
	}
}
