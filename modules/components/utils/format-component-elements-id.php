<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Format_Element_Ids;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Backward-compatibility alias.
 *
 * All logic now lives in {@see Format_Element_Ids}. This class is kept so that
 * existing callers (Component_Instance_Transformer, Component_Instance, and
 * their tests) do not need to be changed.
 */
class Format_Component_Elements_Id extends Format_Element_Ids {}
