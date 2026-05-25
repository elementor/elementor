<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Services\Global_Class_Css_Importer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Global_Classes_Ability extends Abstract_Ability {

	private const VALID_OPERATIONS = [ 'import', 'delete' ];
	private const VALID_DUPLICATE_STRATEGIES = [ 'skip', 'update', 'rename' ];

	protected function get_ability_id(): string {
		return 'elementor/manage-global-classes';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Global Classes', 'elementor' ),
			__( 'Import or delete Elementor global classes using CSS. Input is `.label { … }` blocks; only `color` and supported size properties are converted to typed props — all other declarations are preserved as raw custom CSS on the class. Breakpoints and pseudo-states are not supported in this version (every block becomes one desktop variant).', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'css' => [ 'type' => 'string' ],
					'watermark' => [ 'type' => 'integer' ],
					'errors' => [ 'type' => 'array' ],
					'css_unconverted' => [ 'type' => 'array' ],
					'results' => [ 'type' => 'array' ],
					'deleted_labels' => [ 'type' => 'array' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'show_in_rest' => true,
			],
			function () {
				return current_user_can( 'manage_options' );
			},
			[
				'type' => 'object',
				'properties' => [
					'operation' => [
						'type' => 'string',
						'enum' => self::VALID_OPERATIONS,
						'description' => 'import = upsert classes from CSS; delete = soft-delete classes by label.',
					],
					'css' => [
						'type' => 'string',
						'description' => 'Stylesheet body, e.g. ".card { color: #333; padding: 16px; }". For delete, an empty body works: ".card { }".',
					],
					'duplicate_strategy' => [
						'type' => 'string',
						'enum' => self::VALID_DUPLICATE_STRATEGIES,
						'default' => 'update',
						'description' => 'How to handle a label that already exists. Import only.',
					],
				],
				'required' => [ 'operation', 'css' ],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$operation = isset( $input['operation'] ) ? (string) $input['operation'] : '';
		$css = isset( $input['css'] ) ? (string) $input['css'] : '';

		if ( ! in_array( $operation, self::VALID_OPERATIONS, true ) ) {
			return new \WP_Error(
				'invalid_operation',
				sprintf( 'Operation must be one of: %s.', implode( ', ', self::VALID_OPERATIONS ) ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( '' === trim( $css ) ) {
			return new \WP_Error(
				'missing_css',
				'css is required.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$importer = Global_Class_Css_Importer::make();

		if ( 'delete' === $operation ) {
			return $importer->delete_by_css( $css );
		}

		$duplicate_strategy = isset( $input['duplicate_strategy'] ) && in_array( $input['duplicate_strategy'], self::VALID_DUPLICATE_STRATEGIES, true )
			? $input['duplicate_strategy']
			: 'update';

		return $importer->import_from_css( $css, $duplicate_strategy );
	}
}
