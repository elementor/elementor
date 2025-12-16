<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base as New_Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// TODO: Remove this class after 3.36 is released.
/**
 * @deprecated 3.34 Use \Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base instead.
 */
abstract class Atomic_Control_Base extends New_Atomic_Control_Base {}
