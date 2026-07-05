<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Simple_Resource_Ability extends Abstract_Ability {
	const URI_SCHEME    = 'elementor://';
	const RESOURCES_DIR = __DIR__ . '/../static-resources/';

	private string $uri;
	private string $label;
	private string $file_path;

	public function __construct( string $uri, string $label ) {
		$this->uri       = $uri;
		$this->label     = $label;
		$this->file_path = $this->resolve_file_path( $uri );

		if ( ! file_exists( $this->file_path ) ) {
			throw new \InvalidArgumentException(
				__( 'Static resource file not found', 'elementor' ) // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			);
		}
	}

	protected function get_ability_id(): string {
		return 'elementor/' . ltrim( str_replace( self::URI_SCHEME, '', $this->uri ), '/' );
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			$this->label,
			$this->label,
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => $this->uri,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => $this->label,
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return file_get_contents( $this->file_path );
	}

	private function resolve_file_path( string $uri ): string {
		$relative_path = ltrim( str_replace( self::URI_SCHEME, '', $uri ), '/' );
		return self::RESOURCES_DIR . $relative_path . '.md';
	}
}
