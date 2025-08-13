<?php
namespace Elementor\Modules\CssConverter\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CssParseException extends \Exception {
	public function __construct( $message = '', $code = 0, \Throwable $previous = null ) {
		$message = $message ? $message : 'Failed to parse CSS';
		parent::__construct( $message, $code, $previous );
	}
}
