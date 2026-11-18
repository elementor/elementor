<?php

namespace Elementor\Modules\CompositeWidgets\Definitions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Definition {
	const SOURCE_CODE = 'code';
	const SOURCE_SITE = 'site';
	const ID_NAMESPACE_SEPARATOR = '/';
	const DEFAULT_VERSION = 1;

	private string $id;
	private int $version = self::DEFAULT_VERSION;
	private string $title = '';
	private ?string $icon = null;
	private ?string $category = null;
	private ?bool $detachable = null;
	private array $template = [];
	private array $general = [];
	private ?array $style = null;

	/**
	 * Ids are `<namespace>/<name>`; site widgets use the `site` namespace.
	 */
	public static function get_id_namespace( string $id ): string {
		$separator_position = strpos( $id, self::ID_NAMESPACE_SEPARATOR );

		return false === $separator_position ? '' : substr( $id, 0, $separator_position );
	}

	public static function is_site_namespace( string $id ): bool {
		return self::SOURCE_SITE === self::get_id_namespace( $id );
	}

	public static function make( string $id ): self {
		return new self( $id );
	}

	private function __construct( string $id ) {
		$this->id = $id;
	}

	public function version( int $version ): self {
		$this->version = $version;
		return $this;
	}

	public function title( string $title ): self {
		$this->title = $title;
		return $this;
	}

	public function icon( string $icon ): self {
		$this->icon = $icon;
		return $this;
	}

	public function category( string $category ): self {
		$this->category = $category;
		return $this;
	}

	public function detachable( bool $detachable ): self {
		$this->detachable = $detachable;
		return $this;
	}

	public function template( array $template ): self {
		$this->template = $template;
		return $this;
	}

	public function general( array $general ): self {
		$this->general = $general;
		return $this;
	}

	public function style( array $style ): self {
		$this->style = $style;
		return $this;
	}

	public function build(): array {
		$definition = [
			'id' => $this->id,
			'version' => $this->version,
			'source' => self::SOURCE_CODE,
			'title' => $this->title,
			'icon' => $this->icon,
			'category' => $this->category,
			'detachable' => $this->detachable,
			'template' => $this->template,
			'general' => $this->general,
			'style' => $this->style,
		];

		return array_filter( $definition, fn ( $value ) => null !== $value );
	}
}
