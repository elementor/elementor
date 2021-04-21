<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kit_Not_Found_Exception extends \Exception {
	/**
	 * @var array
	 */
	protected $response;

	public function __construct( $id ) {
		parent::__construct(
			sprintf( __( 'Kit id %s not found.', 'elementor' ), $id ),
			404
		);
	}
}
