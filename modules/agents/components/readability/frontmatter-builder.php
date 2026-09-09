<?php

namespace Elementor\Modules\Agents\Components\Readability;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds a YAML frontmatter block for a given post.
 *
 * All user-supplied string values are passed through `sanitize_metadata()`
 * (strips HTML tags, zero-width characters, and control characters, then
 * normalises whitespace) before being embedded in the YAML output.
 *
 * String values embedded in double-quoted YAML scalars are escaped via
 * `escape_yaml_string()`.
 */
class Frontmatter_Builder {

	/**
	 * Build the full YAML frontmatter block, including `---` delimiters.
	 *
	 * @param \WP_Post $post         The post to describe.
	 * @param string   $extractor_id Optional extractor identifier for provenance.
	 * @return string YAML frontmatter enclosed in `---` fences.
	 */
	public function build( \WP_Post $post, string $extractor_id = '' ): string {
		$lines   = [ '---' ];
		$post_id = $post->ID;

		// Title.
		$title = $this->sanitize_metadata( get_the_title( $post_id ) );
		$lines[] = 'title: "' . $this->escape_yaml_string( $title ) . '"';

		// Description — Yoast → AIOSEO → excerpt → empty.
		$description = $this->get_description( $post_id );

		if ( '' !== $description ) {
			$lines[] = 'description: "' . $this->escape_yaml_string( $description ) . '"';
		}

		// URL and canonical.
		$permalink = get_permalink( $post_id );

		if ( is_string( $permalink ) && '' !== $permalink ) {
			$url     = esc_url( $permalink );
			$lines[] = 'url: "' . $url . '"';
			$lines[] = 'canonical: "' . $url . '"';
		}

		// Post type.
		$lines[] = 'post_type: "' . $this->escape_yaml_string( $post->post_type ) . '"';

		// Author display name.
		$author = $this->get_author_name( (int) $post->post_author );

		if ( '' !== $author ) {
			$lines[] = 'author: "' . $this->escape_yaml_string( $author ) . '"';
		}

		// Published and modified dates (ISO 8601).
		$date_published = get_the_date( 'c', $post_id );

		if ( is_string( $date_published ) && '' !== $date_published ) {
			$lines[] = 'date_published: "' . $this->escape_yaml_string( $date_published ) . '"';
		}

		$date_modified = get_the_modified_date( 'c', $post_id );

		if ( is_string( $date_modified ) && '' !== $date_modified ) {
			$lines[] = 'date_modified: "' . $this->escape_yaml_string( $date_modified ) . '"';
		}

		// Featured image.
		$featured_image = get_the_post_thumbnail_url( $post_id, 'full' );

		if ( is_string( $featured_image ) && '' !== $featured_image ) {
			$lines[] = 'featured_image: "' . esc_url( $featured_image ) . '"';
		}

		// Categories and tags (blog posts only).
		if ( 'post' === $post->post_type ) {
			$categories = $this->get_term_names( $post_id, 'category' );

			if ( '' !== $categories ) {
				$lines[] = 'categories: "' . $this->escape_yaml_string( $categories ) . '"';
			}

			$tags = $this->get_term_names( $post_id, 'post_tag' );

			if ( '' !== $tags ) {
				$lines[] = 'tags: "' . $this->escape_yaml_string( $tags ) . '"';
			}
		}

		// Extractor provenance.
		if ( '' !== $extractor_id ) {
			$lines[] = 'extractor: "' . $this->escape_yaml_string( $extractor_id ) . '"';
		}

		$lines[] = '---';

		return implode( "\n", $lines );
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Return a sanitized meta description string.
	 *
	 * Priority: Yoast → AIOSEO → excerpt → ''.
	 *
	 * @param int $post_id
	 * @return string
	 */
	private function get_description( int $post_id ): string {
		$candidates = [
			(string) get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ),
			(string) get_post_meta( $post_id, '_aioseo_description', true ),
			(string) get_the_excerpt( $post_id ),
		];

		foreach ( $candidates as $candidate ) {
			$clean = $this->sanitize_metadata( $candidate );

			if ( '' !== $clean ) {
				return $clean;
			}
		}

		return '';
	}

	/**
	 * Return the display name of a user by ID, or '' when not found.
	 *
	 * @param int $user_id
	 * @return string
	 */
	private function get_author_name( int $user_id ): string {
		if ( 0 === $user_id ) {
			return '';
		}

		$user = get_userdata( $user_id );

		if ( ! $user ) {
			return '';
		}

		return $this->sanitize_metadata( $user->display_name );
	}

	/**
	 * Return a comma-joined list of term names for the given taxonomy.
	 *
	 * @param int    $post_id
	 * @param string $taxonomy
	 * @return string
	 */
	private function get_term_names( int $post_id, string $taxonomy ): string {
		$terms = get_the_terms( $post_id, $taxonomy );

		if ( ! is_array( $terms ) || empty( $terms ) ) {
			return '';
		}

		$names = array_map(
			fn( \WP_Term $term ) => $this->sanitize_metadata( $term->name ),
			$terms
		);

		$names = array_filter( $names, static fn( string $n ) => '' !== $n );

		return implode( ', ', $names );
	}

	/**
	 * Sanitize a metadata string: strip HTML, remove zero-width and control
	 * characters, and collapse internal whitespace.
	 *
	 * @param string $value
	 * @return string
	 */
	private function sanitize_metadata( string $value ): string {
		// Decode entities before stripping tags so we don't leave bare entities.
		$value = html_entity_decode( $value, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$value = wp_strip_all_tags( $value );

		// Remove zero-width space and similar invisible Unicode.
		$value = str_replace( "\xE2\x80\x8B", '', $value );

		// Remove ASCII control characters (excluding tab, LF, CR — handled below).
		$value = preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value );

		// Normalise whitespace.
		$value = preg_replace( '/[ \t]+/', ' ', $value );
		$value = trim( $value );

		return $value;
	}

	/**
	 * Escape a string for embedding inside a double-quoted YAML scalar.
	 *
	 * Handles: backslashes, double-quotes, newlines, carriage returns, tabs.
	 *
	 * @param string $value
	 * @return string
	 */
	private function escape_yaml_string( string $value ): string {
		return strtr( $value, [
			'\\' => '\\\\',
			'"'  => '\\"',
			"\n" => '\\n',
			"\r" => '\\r',
			"\t" => '\\t',
		] );
	}
}
