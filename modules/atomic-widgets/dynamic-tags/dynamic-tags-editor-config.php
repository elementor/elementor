<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\Controls\V3_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Editor_Config {

	private Dynamic_Tags_Schemas $schemas;

	private ?array $tags = null;

	public function __construct( Dynamic_Tags_Schemas $schemas ) {
		$this->schemas = $schemas;
	}

	public function get_tags(): array {
		if ( null !== $this->tags ) {
			return $this->tags;
		}

		$atomic_tags  = [];
		$dynamic_tags = Plugin::$instance->dynamic_tags->get_tags_config();

		foreach ( $dynamic_tags as $name => $tag ) {
			$atomic_tag = $this->convert_dynamic_tag_to_atomic( $tag );

			if ( $atomic_tag ) {
				$atomic_tags[ $name ] = $atomic_tag;
			}
		}

		$this->tags = $atomic_tags;

		return $this->tags;
	}

	/**
	 * @param string $name
	 *
	 * @return null|array{
	 *       name: string,
	 *       categories: string[],
	 *       label: string,
	 *       group: string,
	 *       atomic_controls: array,
	 *       props_schema: array<string, Transformable_Prop_Type>
	 *  }
	 */
	public function get_tag( string $name ): ?array {
		$tags = $this->get_tags();

		return $tags[ $name ] ?? null;
	}

	private function convert_dynamic_tag_to_atomic( $tag ) {
		if ( empty( $tag['name'] ) || empty( $tag['categories'] ) ) {
			return null;
		}

		$converted_tag = [
			'name'            => $tag['name'],
			'categories'      => $tag['categories'],
			'label'           => $tag['title'] ?? '',
			'group'           => $tag['group'] ?? '',
			'atomic_controls' => [],
			'props_schema'    => $this->schemas->get( $tag['name'] ),
		];

		if ( ! isset( $tag['controls'] ) ) {
			return $converted_tag;
		}

		try {
			$atomic_controls = V3_Converter::make( $tag['controls'] )
				->get_atomic_controls( $tag['force_convert_to_atomic'] ?? false );
		} catch ( \Exception $e ) {
			return null;
		}

		if ( null === $atomic_controls ) {
			return null;
		}

		$converted_tag['atomic_controls'] = $atomic_controls;

		return $converted_tag;
	}
}
