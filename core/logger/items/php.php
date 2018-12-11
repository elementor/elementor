<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class PHP extends File {
	const FORMAT = 'PHP: date [type] message [meta][file::line] X times';

	public function get_name() {
		return 'PHP';
	}
}
