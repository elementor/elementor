<?php
namespace Elementor\Core\Kits\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kit_Not_Exists_Exception extends \Exception {
	public function __construct( $message = '', $code = 0, $previous = null ) {
		if ( ! $message ) {
			$message = 'Site kit not exists or not valid. please try to recreate one.';
		}

		parent::__construct( $message, $code, $previous );
	}
}
