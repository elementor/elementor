<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base as New_Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @deprecated 3.34 Use \Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base instead.
 */
abstract class Atomic_Control_Base extends New_Atomic_Control_Base {
	public function __construct( string $prop_name ) {
		_deprecated_class( __CLASS__, '3.34', New_Atomic_Control_Base::class );
		parent::__construct( $prop_name );
	}
}

