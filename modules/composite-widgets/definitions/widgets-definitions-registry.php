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
	const ARCHIVED_KEY = 'archived';

	private Widget_Definition_Validator $validator;
	private Definition_Migrator $migrator;

	/** @var array<string, array> */
	private array $definitions = [];

	/**
	 * Site definitions are registered here, before any code provider runs, through a registrar that
	 * exists only for `$register_site_definitions`: the register hook gets `register()`, which accepts
	 * code definitions only.
	 *
	 * @param Widget_Definition_Validator $validator
	 * @param Definition_Migrator         $migrator
	 * @param callable|null               $register_site_definitions Receives a `Site_Definitions_Registrar`.
	 */
	public function __construct(
		Widget_Definition_Validator $validator,
		Definition_Migrator $migrator,
		?callable $register_site_definitions = null
	) {
		$this->validator = $validator;
		$this->migrator = $migrator;

		if ( null !== $register_site_definitions ) {
			$register_site_definitions(
				new Site_Definitions_Registrar( fn ( array $definition, bool $is_archived ) => $this->add_site_definition( $definition, $is_archived ) )
			);
		}
	}

	/**
	 * The code provider's entry point: only `source: code` is accepted, so a definition can't opt out of
	 * the global-reference rule by declaring itself a site widget. The `site/` id namespace belongs to site widgets.
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

		$id = $this->get_id( $data );

		if ( Widget_Definition::SOURCE_CODE !== ( $data['source'] ?? Widget_Definition::SOURCE_CODE ) ) {
			$this->report_invalid( $id, 'source: ' . Definition_Error_Codes::DEFINITION_INVALID );
			return false;
		}

		if ( $this->is_site_id( $id ) ) {
			$this->report_invalid( $id, 'id: ' . Definition_Error_Codes::DEFINITION_INVALID );
			return false;
		}

		$data['source'] = Widget_Definition::SOURCE_CODE;

		return $this->add( $id, $data );
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

	/**
	 * `archived` is storage state, not part of the definition: it's set after validation.
	 */
	private function add_site_definition( array $definition, bool $is_archived ): bool {
		$id = $this->get_id( $definition );

		unset( $definition[ self::ARCHIVED_KEY ] );

		if ( ! $this->is_site_id( $id ) ) {
			$this->report_invalid( $id, 'id: ' . Definition_Error_Codes::DEFINITION_INVALID );
			return false;
		}

		$definition['source'] = Widget_Definition::SOURCE_SITE;

		if ( ! $this->add( $id, $definition ) ) {
			return false;
		}

		if ( $is_archived ) {
			$this->definitions[ $id ][ self::ARCHIVED_KEY ] = true;
		}

		return true;
	}

	private function add( string $id, array $data ): bool {
		$this->migrator->migrate( $data );

		$result = $this->validator->validate( $data );

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

	private function get_id( array $data ): string {
		return is_string( $data['id'] ?? null ) ? $data['id'] : self::UNKNOWN_DEFINITION_ID;
	}

	private function is_site_id( string $id ): bool {
		return 0 === strpos( $id, Widget_Definition::SITE_ID_PREFIX );
	}

	private function report_invalid( string $id, string $errors ): void {
		_doing_it_wrong(
			esc_html( static::class . '::register' ),
			sprintf( 'Composite widget "%s" was not registered: %s', esc_html( $id ), esc_html( $errors ) ),
			esc_html( self::INVALID_DEFINITION_VERSION )
		);
	}
}
