<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Controls\Dynamic_Section;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Heading extends Atomic_Widget_Base {
	public function get_name() {
		return 'a-heading';
	}

	public function get_title() {
		return esc_html__( 'Atomic Heading', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-t-letter';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		$format = $this->get_heading_template( ! empty( $settings['link']['href'] ) );
		$args = $this->get_template_args( $settings );

		printf( $format, ...$args ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function get_heading_template( bool $is_link_enabled ): string {
		return $is_link_enabled ? '<%1$s %2$s><a %3$s>%4$s</a></%1$s>' : '<%1$s %2$s>%3$s</%1$s>';
	}

	private function get_template_args( array $settings ): array {
		$tag = $settings['tag'];
		$title = esc_html( $settings['title'] );
		$attrs = array_filter( [
			'class' => $settings['classes'] ?? '',
		] );

		$default_args = [
			Utils::validate_html_tag( $tag ),
			Utils::render_html_attributes( $attrs ),
		];

		if ( ! empty( $settings['link']['href'] ) ) {
			$link_args = [
				Utils::render_html_attributes( $settings['link'] ),
				esc_html( $title ),
			];

			return array_merge( $default_args, $link_args );
		}

		$default_args[] = $title;

		return $default_args;
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Textarea_Control::bind_to( 'title' )
						->set_label( __( 'Title', 'elementor' ) )
						->set_placeholder( __( 'Type your title here', 'elementor' ) ),
					Select_Control::bind_to( 'tag' )
						->set_label( esc_html__( 'Tag', 'elementor' ) )
						->set_options( [
							[
								'value' => 'h1',
								'label' => 'H1',
							],
							[
								'value' => 'h2',
								'label' => 'H2',
							],
							[
								'value' => 'h3',
								'label' => 'H3',
							],
							[
								'value' => 'h4',
								'label' => 'H4',
							],
							[
								'value' => 'h5',
								'label' => 'H5',
							],
							[
								'value' => 'h6',
								'label' => 'H6',
							],
						]),
					Link_Control::bind_to( 'link' )
						->set_options( $this->get_post_query() )
						->set_allow_custom_values( true )
						->set_placeholder( __( 'Paste URL or type', 'elementor' ) ),
				] ),
		];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'tag' => String_Prop_Type::make()
				->enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] )
				->default( 'h2' ),

			'title' => String_Prop_Type::make()
				->default( __( 'Your Title Here', 'elementor' ) ),

			'link' => Link_Prop_Type::make(),
		];
	}

	/**
	 * Todo: Remove and replace with REST API as part of ED-16723
	 */
	private function get_posts_per_post_type_map( $excluded_types = [] ) {
		$post_types = new Collection( get_post_types( [ 'public' => true ], 'object' ) );

		if ( ! empty( $excluded_types ) ) {
			$post_types = $post_types->filter( function( $post_type ) use ( $excluded_types ) {
				return ! in_array( $post_type->name, $excluded_types, true );
			} );
		}

		$post_type_slugs = $post_types->map( function( $post_type ) {
			return $post_type->name;
		} );

		$posts = new Collection( get_posts( [
			'post_type' => $post_type_slugs->all(),
			'numberposts' => -1,
		] ) );

		return $posts->reduce( function ( $carry, $post ) use ( $post_types ) {
			$post_type_label = $post_types->get( $post->post_type )->label;

			if ( ! isset( $carry[ $post->post_type ] ) ) {
				$carry[ $post->post_type ] = [
					'label' => $post_type_label,
					'items' => [],
				];
			}

			$carry[ $post->post_type ]['items'][] = $post;

			return $carry;
		}, [] );
	}

	private function get_excluded_post_types( ?array $additional_exclusions = [] ) {
		return array_merge( [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ], $additional_exclusions );
	}

	private function get_post_query(): array {
		$excluded_types = $this->get_excluded_post_types();
		$posts_map = $this->get_posts_per_post_type_map( $excluded_types );
		$options = new Collection( [] );

		foreach ( $posts_map as $post_type_slug => $data ) {
			$options = $options->union( $this->get_formatted_post_options( $data['items'], $posts_map[ $post_type_slug ]['label'] ) );
		}

		return $options->all();
	}

	private function get_formatted_post_options( $items, $group_label ) {
		$options = [];

		foreach ( $items as $post ) {
			$options[ $post->guid ] = [
				'label' => $post->post_title,
				'groupLabel' => $group_label,
			];
		}

		return $options;
	}
}
