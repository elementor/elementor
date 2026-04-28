<?php

namespace Elementor\Modules\AtomicWidgets\Documents\Base;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Abstract base class for documents that adopt the v4 atomic style schema.
 *
 * Parallels Atomic_Widget_Base for widgets. Concrete subclasses must implement:
 *   - define_props_schema(): array  — the atomic prop types for this document
 *   - get_css_wrapper_selector(): string — CSS selector scoping document styles
 *
 * Note: For Theme Builder documents (header, footer, etc.) that already extend a
 * pro-plugin class (e.g. Header extends Header_Footer_Base), extend that class
 * directly and apply Has_Atomic_Document + Has_Base_Document_Styles as traits,
 * since PHP does not support multiple inheritance. This class is provided for
 * free-plugin atomic documents that have no existing inheritance chain to preserve.
 */
abstract class Atomic_Document_Base extends Document {
	use Has_Atomic_Document;
	use Has_Base_Document_Styles;

	/**
	 * Define the atomic props schema for this document type.
	 *
	 * @return array<string, \Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;

	/**
	 * Returns the CSS selector that wraps this document's rendered output.
	 * Used to scope base styles to this document's DOM wrapper.
	 *
	 * @return string e.g. '.elementor-location-header' or 'body.elementor-page-123'
	 */
	abstract public function get_css_wrapper_selector(): string;
}
