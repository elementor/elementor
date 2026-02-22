<?php

namespace Elementor\Modules\Variables\Storage;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Constants {
	public const FORMAT_VERSION_V1 = 1;
	public const FORMAT_VERSION_V2 = 2;
	public const TOTAL_VARIABLES_COUNT = 1000;
	public const VARIABLES_META_KEY = '_elementor_global_variables';
}
