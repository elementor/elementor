<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class JS extends File {
	const FORMAT = 'JS :date [:type] :message :file::line';
}