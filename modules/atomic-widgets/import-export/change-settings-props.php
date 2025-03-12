<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Change_Settings_Props {
	private Props_Resolver $props_resolver;

	private array $schema;

	public function __construct( Props_Resolver $props_resolver, array $schema ) {
		$this->props_resolver = $props_resolver;
		$this->schema = $schema;
	}

	public static function make( Props_Resolver $props_resolver, array $schema ): self {
		return new self( $props_resolver, $schema );
	}

	public function run( array $element ) {
		if ( ! empty( $element['settings'] ) ) {
			$element['settings'] = $this->props_resolver->resolve( $this->schema, $element['settings'] );
		}

		return $element;
	}
}
