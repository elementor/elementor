<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

class Element_Builder {
	protected $element_type;
	protected $settings = [];
	protected $is_locked = false;
	protected $children = [];
	protected $editor_settings = [];
	protected $meta = [];
	protected $hydrate_default_children = false;

	public static function make( string $element_type ) {
		return new self( $element_type );
	}

	private function __construct( string $element_type ) {
		$this->element_type = $element_type;
	}

	public function settings( array $settings ) {
		$this->settings = $settings;
		return $this;
	}

	public function is_locked( $is_locked ) {
		$this->is_locked = $is_locked;
		return $this;
	}

	public function editor_settings( array $editor_settings ) {
		$this->editor_settings = $editor_settings;
		return $this;
	}

	public function children( array $children ) {
		$this->children = $children;
		return $this;
	}

	public function meta( array $meta ) {
		$this->meta = $meta;
		return $this;
	}

	/**
	 * Opt this element payload into client-side default-children hydration.
	 *
	 * When the payload is inserted into the editor model tree by the
	 * children-dependencies reconciler (or any code path that constructs a
	 * Backbone `AtomicElementBaseModel` from raw data), the model's
	 * `initialize()` sees `hydrateDefaultChildren: true` and routes through
	 * `onElementCreate()` → `getDefaultChildren()` to seed defaults. Hydration
	 * cascades to every nested level via `buildElement()`.
	 *
	 * Only meaningful on payloads that reach the editor model init path
	 * (typically `Child_Dependency::default_model()`). Silently ignored when
	 * used inside `define_default_children()` return values — `buildElement()`
	 * on the JS side controls that flag per level itself.
	 */
	public function hydrate_default_children( bool $hydrate = true ) {
		$this->hydrate_default_children = $hydrate;
		return $this;
	}

	public function build() {
		$element_data = [
			'elType' => $this->element_type,
			'settings' => $this->settings,
			'isLocked' => $this->is_locked,
			'editor_settings' => $this->editor_settings,
			'elements' => $this->children,
		];

		if ( ! empty( $this->meta ) ) {
			$element_data['meta'] = $this->meta;
		}

		if ( $this->hydrate_default_children ) {
			$element_data['hydrateDefaultChildren'] = true;
		}

		return $element_data;
	}
}
