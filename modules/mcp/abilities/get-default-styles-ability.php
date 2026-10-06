<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Element_Default_Styles_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Default_Styles_Ability extends Abstract_Ability {

	private ?Default_Styles_Repository $repository;

	public function __construct( ?Default_Styles_Repository $repository = null ) {
		$this->repository = $repository;
	}

	protected function get_ability_id(): string {
		return 'elementor/get-default-styles';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Default Styles', 'elementor' ),
			__( 'Returns the active kit\'s site-wide default styles for a single HTML wrapper tag (h1..h6, p, a, section, div, button, ...) as a raw CSS string. Includes selectors, @media(--breakpoint) blocks, and &:hover/&:focus/&:active pseudo-states as the frontend renders them. Widget-specific base styles are NOT included — this is only the kit\'s site-wide default layer.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'tag', 'default_styles' ],
				'properties' => [
					'tag' => [
						'type' => 'string',
						'description' => 'Echoes the requested HTML tag.',
					],
					'default_styles' => [
						'type' => 'string',
						'description' => 'Raw CSS string of the kit site-wide default for this tag. Empty when the kit has no default set for the tag.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'required' => [ 'tag' ],
				'properties' => [
					'tag' => [
						'type' => 'string',
						'description' => 'HTML wrapper tag to look up (e.g. h2, p, a, button, section). Must be one of Elementor\'s allowed wrapper tags.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$tag = isset( $input['tag'] ) ? (string) $input['tag'] : '';

		if ( '' === $tag ) {
			return new \WP_Error(
				'invalid_input',
				__( 'A tag is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! class_exists( Default_Styles_Repository::class ) || ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
			return new \WP_Error(
				'invalid_tag',
				__( 'The provided tag is not an allowed HTML wrapper tag.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return [
			'tag' => $tag,
			'default_styles' => Element_Default_Styles_Builder::render_kit_default( $tag, $this->get_repository() ),
		];
	}

	private function get_repository(): ?Default_Styles_Repository {
		if ( null !== $this->repository ) {
			return $this->repository;
		}

		$this->repository = Default_Styles_Repository::make();

		return $this->repository;
	}
}
