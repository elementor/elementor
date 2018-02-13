<?php

namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Exceptions {

	const BAD_REQUEST = 400;
	const UNAUTHORIZED = 401;
	const FORBIDDEN = 403;
	const NOT_FOUND = 404;
	const INTERNAL_SERVER_ERROR = 500;
}
