<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Modules\Sdk\V4\Builder\Elements\Schema_Properties_Validator;
use Exception;

class Element_Schema_Validator {


	use Schema_Properties_Validator;
	use Schema_Assets_Validator;

	private array $schema;

	public function __construct( array &$schema_ref ) {
		$this->schema = &$schema_ref;
	}

	public function &get_schema(): array {
		return $this->schema;
	}

	public function validate(): bool {
		$schema = $this->get_schema();
		if ( ! isset( $schema['name'] ) ) {
			throw new Exception( 'Schema must have a name' );
		}
		if ( ! isset( $schema['widget_alias'] ) ) {
			throw new Exception( 'Schema must have a widget_alias' );
		}
		$properties = $schema['properties'] ?? [];
		foreach ( $properties as $property ) {
			$this->validate_property( $property );
		}
		$this->validate_assets( $schema );
		return true;
	}

	/**
	 * @return string
	 * @throws Exception
	 */
	public function get_element_name(): string {
		return $this->schema['name'] ?? throw new Exception( 'Schema must have a name' );
	}

	public function get_widget_alias(): string {
		return $this->schema['widget_alias'] ?? throw new Exception( 'Schema must have a widget_alias' );
	}

	public function set_element_name( string $name ): self {
		$schema = &$this->get_schema();
		$schema['name'] = $name;
		// Setup widget-alias
		$widget_alias = str_replace( '-', '_', $name );
		$widget_alias = str_replace( ' ', '_', $widget_alias );
		$widget_alias = strtolower( $widget_alias );
		$schema['widget_alias'] = $widget_alias;
		return $this;
	}

	public function set_assets_dir( string $dir ): self {
		$schema = &$this->get_schema();
		$schema['_path'] = $dir;
		return $this;
	}
}
