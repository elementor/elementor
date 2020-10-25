<?php
namespace Elementor\Data\Base\Endpoint\Index;

use Elementor\Data\Base\Endpoint\Index;

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
class Recursive extends Index {
	public function get_items( $request ) {
		return $this->get_items_recursive( [ $this ] );
	}

	/**
	 * Retrieves a recursive collection of all endpoint(s), items.
	 *
	 * Get items recursive, will run overall endpoints of the current controller.
	 * For each endpoint it will run `$endpoint->getItems( $request ) // the $request passed in get_items_recursive`.
	 * Will skip $skip_endpoints endpoint(s).
	 *
	 * Example, scenario:
	 * Controller 'test-controller'.
	 * Controller endpoints: 'endpoint1', 'endpoint2'.
	 * Endpoint2 get_items method: `get_items() { return 'test' }`.
	 * Call `Controller.get_items_recursive( ['endpoint1'] )`, result: [ 'endpoint2' => 'test' ];
	 *
	 * @param array $skip_endpoints
	 *
	 * @return array
	 */
	public function get_items_recursive( $skip_endpoints = [] ) {
		$response = [];

		foreach ( $this->controller->endpoints as $endpoint ) {
			// Skip self.
			if ( in_array( $endpoint, $skip_endpoints, true ) ) {
				continue;
			}

			$response[ $endpoint->get_name() ] = $endpoint->get_items( null );
		}

		return $response;
	}
}
