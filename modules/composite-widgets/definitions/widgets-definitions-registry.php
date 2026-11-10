<?php

namespace Elementor\Modules\CompositeWidgets\Definitions;

use Elementor\Modules\CompositeWidgets\Definitions\Validation\Definition_Error_Codes;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Widget_Definition_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widgets_Definitions_Registry {
	const INVALID_DEFINITION_VERSION = '4.5.0';
	const UNKNOWN_DEFINITION_ID = '(unknown)';

	private Widget_Definition_Validator $validator;

	/** @var array<string, array> */
	private array $definitions = [];

	public function __construct( Widget_Definition_Validator $validator ) {
		$this->validator = $validator;
	}

	/**
	 * Invalid definitions are dropped with `_doing_it_wrong`, so a broken addon can't break the editor.
	 *
	 * @param Widget_Definition|array $definition
	 */
	public function register( $definition ): bool {
		$data = $definition instanceof Widget_Definition ? $definition->build() : $definition;

		if ( ! is_array( $data ) ) {
			$this->report_invalid( self::UNKNOWN_DEFINITION_ID, Definition_Error_Codes::DEFINITION_INVALID );
			return false;
		}

		$data['source'] = $data['source'] ?? Widget_Definition::SOURCE_CODE;

		$result = $this->validator->validate( $data );
		$id = is_string( $data['id'] ?? null ) ? $data['id'] : self::UNKNOWN_DEFINITION_ID;

		if ( ! $result->is_valid() ) {
			$this->report_invalid( $id, $result->errors()->to_string() );
			return false;
		}

		if ( isset( $this->definitions[ $id ] ) ) {
			$this->report_invalid( $id, 'id: ' . Definition_Error_Codes::DUPLICATE_ID );
			return false;
		}

		$this->definitions[ $id ] = $result->unwrap();

		return true;
	}

	public function register_from_json( string $path ): bool {
		$definition = is_readable( $path ) ? wp_json_file_decode( $path, [ 'associative' => true ] ) : null;

		if ( ! is_array( $definition ) ) {
			$this->report_invalid( $path, Definition_Error_Codes::DEFINITION_INVALID );
			return false;
		}

		return $this->register( $definition );
	}

	public function get( string $id ): ?array {
		return $this->definitions[ $id ] ?? null;
	}

	/**
	 * @return array<string, array>
	 */
	public function all(): array {
		return $this->definitions;
	}

	private function report_invalid( string $id, string $errors ): void {
		_doing_it_wrong(
			esc_html( static::class . '::register' ),
			sprintf( 'Composite widget "%s" was not registered: %s', esc_html( $id ), esc_html( $errors ) ),
			esc_html( self::INVALID_DEFINITION_VERSION )
		);
	}
}
