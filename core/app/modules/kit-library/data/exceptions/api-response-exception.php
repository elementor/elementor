<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Api_Response_Exception extends \Exception {
	/**
	 * @var array
	 */
	protected $response;

	public function __construct( array $response ) {
		parent::__construct(
			wp_remote_retrieve_response_message( $response ),
			wp_remote_retrieve_response_code( $response )
		);

		$this->response = $response;
	}
}
