<?php
namespace Elementor\Core\Kits\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kit_Not_Exists extends \Exception {
	public function __construct( $message = '', $code = 0, $previous = null ) {
		$message = $message ? $message : __( 'Kit not exists', 'elementor' );

		parent::__construct( $message, $code, $previous );
	}

}
