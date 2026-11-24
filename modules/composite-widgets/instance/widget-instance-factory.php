<?php

namespace Elementor\Modules\CompositeWidgets\Instance;

use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Server-side counterpart of the editor's `prepareWidgetTemplateForInsert`: both must produce the same instance.
 */
class Widget_Instance_Factory {
	const LOCKED_KEY = 'isLocked';

	private Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator ?? Document_Mutator::instance();
	}

	public function create( array $definition ): array {
		$root = $this->mutator->regenerate_ids( $definition['template'] );

		$root[ Widget_Markers::WIDGET_KEY ] = [
			'id' => $definition['id'],
			'version' => $definition['version'],
		];

		foreach ( array_keys( $root['elements'] ?? [] ) as $index ) {
			Template_Parts::walk( $root['elements'][ $index ], function ( array &$element ) {
				$element[ self::LOCKED_KEY ] = true;
			} );
		}

		return $root;
	}
}
