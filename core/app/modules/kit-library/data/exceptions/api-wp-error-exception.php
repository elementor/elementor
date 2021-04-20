<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Api_Wp_Error_Exception extends \Exception {
	/**
	 * @var \WP_Error
	 */
	protected $error;

	public function __construct( \WP_Error $error ) {
		parent::__construct( $error->get_error_message() );

		$this->error = $error;
	}
}
