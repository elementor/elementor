import { html } from 'https://cdn.jsdelivr.net/npm/lit-html';

export const slider = html`
	<div class="splide" id="presentation">
		<div class="splide__track">
			<ul class="splide__list">

				<li class="splide__slide">
					<e-flex padding="200" height="screen" gap="12"
							alignItems="center" justifyContent="center" direction="column">
						<e-box width="xs"><img src="/img/web-components.svg" alt=""></e-box>
						<e-heading level="1">Elementor Web Components</e-heading>
						<span>By Josh Marom</span>
					</e-flex>
				</li>

				<!-- Frontend Components -->
				<li class="splide__slide" data-splide-hash="component-driven-ui">
					<e-flex maxWidth="4xl" marginInline="auto"
							padding="200" height="screen" gap="12" justifyContent="center" direction="column">
						<e-heading level="1">Frontend Components</e-heading>
						<e-flex gap="10" alignItems="center" justifyContent="center">
							<e-flex width="col8" gap="10" direction="column" alignItems="start">
								<e-text size="xl">
									<p><strong>Component Driven UI</strong> is probably the most significant megatrend
										in frontend development in the past years.</p>

									<p>Angular, React, Vue, Svelte ... - are all using components as a core abstraction
										for
										thinking about the UI.</p>

									<p>Decompose complex screens into simple components.</p>

									<p>Each component has a well-defined API and fixed series of states.<br>
										This allows components to be taken apart and recomposed to build different UIs.
									</p>
								</e-text>
								<e-button size="large" color="primary"><a href="https://www.componentdriven.org/"
																		  target="_blank">Read More</a></e-button>
							</e-flex>

							<e-box width="col3" background="gray-100" radius="l" padding="4">
								<img src="./img/composition.png">
							</e-box>
						</e-flex>
					</e-flex>
				</li>

				<!-- UI Composition -->
				<li class="splide__slide" data-splide-hash="composition">
					<sp-theme scale="medium" color="light">
						<e-flex maxWidth="4xl" marginInline="auto"
								padding="200" height="screen" gap="20" justifyContent="center" direction="column">
							<hgroup>
								<e-heading level="1">UI Composition 🧩</e-heading>
								<e-text size="xl">Demonstrated with <b>Adobe Spectrum</b> component library</e-text>
							</hgroup>
							<e-flex gap="10" alignItems="start" justifyContent="center">
								<e-flex width="col6" gap="6" direction="column" alignItems="center">
									<sp-button onclick="alert('I was clicked');">Click me!</sp-button>

									<sp-icon style="width: 36px; height: 36px;">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" aria-hidden="true"
											 role="img" fill="currentColor">
											<path d="M20 2v10h10L20 2z"/>
											<path d="M19 14a1 1 0 01-1-1V2H7a1 1 0 00-1 1v30a1 1 0 001 1h22a1 1 0 001-1V14zm7 15.5a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h15a.5.5 0 01.5.5zm0-4a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h15a.5.5 0 01.5.5zm0-4a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h15a.5.5 0 01.5.5z"/>
										</svg>
									</sp-icon>

									<sp-action-menu></sp-action-menu>

									<sp-status-light size="m" variant="positive">status light</sp-status-light>

									<sp-popover open style="position: relative">
										<sp-menu>
											<sp-menu-item value="item-1">Deselect</sp-menu-item>
											<sp-menu-item value="item-2">Select inverse</sp-menu-item>
											<sp-menu-item value="item-3">Feather...</sp-menu-item>
											<sp-menu-item value="item-4">Select and mask...</sp-menu-item>
											<sp-menu-item value="item-5">Save selection</sp-menu-item>
											<sp-menu-item value="item-6" disabled>Make work path</sp-menu-item>
										</sp-menu>
									</sp-popover>
								</e-flex>

								<e-flex width="col6" gap="6" direction="column" alignItems="center">
									<sp-card heading="Card Heading" subheading="JPG Photo">
										<img slot="cover-photo" src="https://picsum.photos/200/300" alt="Demo Image"/>
										<div slot="footer">
											<e-flex justifyContent="between">
												<sp-button>Add to Cart</sp-button>
												<sp-action-menu label="More Actions">
													<sp-menu-item>
														Deselect
													</sp-menu-item>
													<sp-menu-item>
														Select inverse
													</sp-menu-item>
													<sp-menu-item>
														Feather...
													</sp-menu-item>
													<sp-menu-item>
														Select and mask...
													</sp-menu-item>
													<sp-menu-divider></sp-menu-divider>
													<sp-menu-item>
														Save selection
													</sp-menu-item>
													<sp-menu-item disabled>
														Make work path
													</sp-menu-item>
												</sp-action-menu>
											</e-flex>
										</div>
									</sp-card>

									<div style="color: var(--spectrum-body-text-color, var(--spectrum-alias-text-color));">
										<sp-card size="s" horizontal heading="Card Heading">
											<div slot="heading">
												<sp-status-light size="m" variant="positive"
																 subheading="Currently Online">
													<div class="subtitle spectrum-Detail spectrum-Detail--sizeS">The
														File You Need
													</div>
												</sp-status-light>
											</div>
											<sp-icon slot="preview" style="width: 36px; height: 36px;">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"
													 aria-hidden="true" role="img" fill="currentColor">
													<path d="M20 2v10h10L20 2z"/>
													<path d="M19 14a1 1 0 01-1-1V2H7a1 1 0 00-1 1v30a1 1 0 001 1h22a1 1 0 001-1V14zm7 15.5a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h15a.5.5 0 01.5.5zm0-4a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h15a.5.5 0 01.5.5zm0-4a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h15a.5.5 0 01.5.5z"/>
												</svg>
											</sp-icon>
										</sp-card>
									</div>
								</e-flex>
							</e-flex>
						</e-flex>
					</sp-theme>
				</li>

				<!-- Benefits of Components -->
				<li class="splide__slide" data-splide-hash="benefits">
					<e-flex maxWidth="6xl" marginInline="auto"
							padding="200" height="screen" gap="12" justifyContent="center" direction="column">
						<e-heading level="1">Benefits of Component-Driven UI Development</e-heading>
						<e-text size="xl">
							<e-flex gap="10" alignItems="start" justifyContent="center" background="gray-100"
									radius="xl" padding="8">
								<e-flex width="col6" gap="4" direction="column">

									<e-flex gap="8" height="48" padding="8" radius="l" elevation="card"
											background="gray-50">
										<img width="64px" src="./img/quality.svg" alt="fast development">
										<div>
											<e-heading level="3">Quality</e-heading>
											Verify that UIs work in different scenarios by building
											components in isolation and defining their relevant states.
										</div>
									</e-flex>

									<e-flex gap="8" height="48" padding="6" radius="l" elevation="card"
											background="gray-50">
										<img width="64px" src="./img/1085672.svg" alt="fast development">
										<div>
											<e-heading level="3">Durability</e-heading>
											Pinpoint bugs down to the detail by testing at the
											component level. It’s less work and more precise than testing screens.
										</div>
									</e-flex>
								</e-flex>

								<e-flex width="col6" gap="4" direction="column">

									<e-flex gap="8" height="48" padding="6" radius="l" elevation="card"
											background="gray-50">
										<img width="64px" src="./img/stopwatch-svgrepo-com.svg" alt="fast development">
										<div>
											<e-heading level="3">Speed</e-heading>
											Assemble UIs faster by reusing existing components from
											a component library or design system.
										</div>
									</e-flex>

									<e-flex gap="8" height="48" padding="6" radius="l" elevation="card"
											background="gray-50">
										<img width="64px" src="./img/team.svg" alt="fast development">
										<div>
											<e-heading level="3">Efficiency</e-heading>
											Parallelize development and design by decomposing
											UI into discrete components then sharing the load between different team
											members.
										</div>
									</e-flex>
								</e-flex>

							</e-flex>
						</e-text>
					</e-flex>
				</li>

				<!-- Elementor Web Components -->
				<li class="splide__slide" data-splide-hash="elementor-web-components">
					<e-flex maxWidth="6xl" marginInline="auto"
							padding="200" height="screen" gap="12" justifyContent="center" direction="column">
						<hgroup>
							<e-heading level="1">Introducing: Elementor Web Components</e-heading>
							<e-heading level="3">A native technology for modern frontend components</e-heading>
						</hgroup>
						<e-flex gap="10" alignItems="start" justifyContent="center">

							<e-flex width="col4" background="gray-100" radius="xl" padding="8">
								<e-text size="xl">
									<p><b>Elementor Web Components</b> Is a collection of new elements for websites.
										These elements
										are based on Native, modern web standards and are widely supported by all modern
										browsers.</p>

									<e-heading level="4">Backwards Compatibility</e-heading>
									<p><b>Elementor Web Components</b> are fully compatible with the existing Elementor
										editor, but they offer
										many advantages over our existing widgets.</p>
								</e-text>
							</e-flex>

							<e-flex width="col8" background="gray-100" radius="xl" padding="8">
								<e-text size="xl">
									<e-flex marginInline="auto" gap="4" justifyContent="center" direction="column">

										<e-flex gap="8" padding="8" radius="l" elevation="card" background="gray-50">
											<img width="64px" src="./img/html-outline.svg" alt="HTML">
											<div>
												<e-heading level="3">Real HTML Elements</e-heading>
												No build or transpile is required for templating - just simple HTML
												elements.
											</div>
										</e-flex>

										<e-flex gap="8" padding="6" radius="l" elevation="card" background="gray-50">
											<img width="64px" src="./img/javascript.svg" alt="JS">
											<div>
												<e-heading level="3">Standard, Native, Universal</e-heading>
												Framework agnostic. standard web technology. Easy for any developer to
												write.
												Compatible with all platforms, including Elementor.
											</div>
										</e-flex>

										<e-flex gap="8" padding="6" radius="l" elevation="card" background="gray-50">
											<img width="64px" src="./img/design.svg" alt="Style">
											<div>
												<e-heading level="3">Effective, Safe, Styling</e-heading>
												Easily encapsulate component styles, while at the same time using
												design tokens to maintain design consistency across components
											</div>
										</e-flex>

									</e-flex>
								</e-text>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

				<!-- E-Button Demo -->
				<li class="splide__slide" data-splide-hash="example-button">
					<e-flex maxWidth="7xl" marginInline="auto" height="screen" gap="12" justifyContent="center"
							direction="column">
						<hgroup>
							<e-heading level="1">Example: E-Button Element</e-heading>
							<e-heading level="3">An alternative Button widget</e-heading>
						</hgroup>
						<e-flex gap="4" alignItems="center" justifyContent="center">
							<e-box width="col6">
								<pre class="code-editor live-code language-html" style="overflow: auto;" data-result-element-id="btnDemo">
									<textarea class="markup">
<e-flex gap="2" alignItems="center" marginBottom="4">
	<e-button color="primary" size="huge">Click</e-button>
	<e-button color="secondary" size="big">Click</e-button>
	<e-button color="danger" size="large">Click</e-button>
	<e-button color="warning" size="medium">Click</e-button>
	<e-button color="success" size="small">Click</e-button>
</e-flex>
<e-flex direction="row-reverse" gap="2" alignItems="center" marginBottom="4">
	<e-button outline color="primary" size="huge">Click</e-button>
	<e-button outline color="secondary" size="big">Click</e-button>
	<e-button outline color="danger" size="large">Click</e-button>
	<e-button outline color="warning" size="medium">Click</e-button>
	<e-button outline color="success" size="small">Click</e-button>
</e-flex>
<e-flex gap="2" alignItems="center" marginBottom="4">
	<e-button quiet color="primary" size="huge">Click</e-button>
	<e-button quiet color="secondary" size="big">Click</e-button>
	<e-button quiet color="danger" size="large">Click</e-button>
	<e-button quiet color="warning" size="medium">Click</e-button>
	<e-button quiet color="success" size="small">Click</e-button>
</e-flex>
									</textarea>
								</pre>
							</e-box>
							<e-box width="col6">
								<div id="btnDemo">
								</div>
							</e-box>
						</e-flex>
					</e-flex>
				</li>

				<!-- Web Components vs Frameworks -->
				<li class="splide__slide" data-splide-hash="wc-vs-frameworks">
					<e-flex maxWidth="6xl" marginInline="auto"
							padding="200" height="screen" gap="12" justifyContent="center" direction="column">
						<hgroup>
							<e-heading level="1">Web Components vs Frameworks</e-heading>
							<e-heading level="3">Why Web Components are a superior solution for websites in comparison
								to frontend frameworks
							</e-heading>
						</hgroup>
						<e-text size="l">
							<e-flex gap="6" alignItems="start" justifyContent="center" background="gray-100" radius="xl"
									padding="8">
								<e-flex align="right" width="col2" marginInline="auto" gap="4" justifyContent="center"
										direction="column">
									<e-box height="16"></e-box>
									<e-box height="24" padding="6" paddingLeft="0">
										Publishing Pipeline
									</e-box>
									<e-box height="24" padding="6" paddingLeft="0">
										Page Size & Loading
									</e-box>
									<e-box height="24" padding="6" paddingLeft="0">
										Page Routing
									</e-box>
									<e-box height="24" padding="6" paddingLeft="0">
										Accessibility and SEO
									</e-box>
								</e-flex>

								<e-flex width="col8" marginInline="auto" gap="4" justifyContent="center"
										direction="column">
									<e-flex justifyContent="center">
										<img style="height: 64px" src="./img/react_logo.svg"/>
										<img style="height: 64px" src="./img/angular_logo.svg"/>
										<img style="height: 64px" src="./img/vue_logo.svg"/>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="error" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>The page is composed of JS Templates</b><br> JavaScript templates (e.g.
											JSX) require transpilation, a build process is required for every edit
										</div>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="error" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>Frontend frameworks are large</b><br> The page cannot be loaded without
											the framework. This has a devastating impact on load time
										</div>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="error" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>SPAs use In-App routing</b><br> This is not ideal for full sites and
											adds many concerns
										</div>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="error" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>Will fail without JS </b><br> In those edge cases where JavaScript
											cannot run, the page will completely fail to load.
										</div>
									</e-flex>
								</e-flex>

								<e-flex width="col8" marginInline="auto" gap="4" justifyContent="center"
										direction="column">
									<e-flex justifyContent="center">
										<img style="height: 64px" src="./img/web-components.svg"/>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="celery" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>The page is written in clean, pure HTML</b><br> No build transpilation
											required. To edit a page, simply edit the markup.
										</div>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="celery" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>No framework required</b><br> The page loads instantly. components are
											loaded as ES modules, allowing for a highly optimized page load
										</div>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="celery" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>Normal web pages</b><br> Pages are served individually like any classic
											website
										</div>
									</e-flex>
									<e-flex height="24" alignItems="center" gap="5" padding="6" radius="l"
											elevation="card" background="gray-50">
										<div>
											<e-icon color="celery" size="m" circular stacked>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
													 viewBox="0 0 12 16">
													<path fill-rule="evenodd"
														  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
												</svg>
											</e-icon>
										</div>
										<div><b>Content can be read without JS</b><br> The page content can be visible
											even for clients that cannot interpret JavaScript
										</div>
									</e-flex>
								</e-flex>
							</e-flex>
						</e-text>
					</e-flex>
				</li>

				<!-- Render Template -->
				<li class="splide__slide" data-splide-hash="render-template">
					<e-flex maxWidth="7xl" marginInline="auto"
							padding="200" height="screen" gap="6" justifyContent="center" direction="column">
						<hgroup>
							<e-heading style="--ewc-heading-color: var(--ewc-color-gray-500)" level="3">Web Components
								vs Classic Widgets
							</e-heading>
							<e-heading level="1">The Render Template</e-heading>
						</hgroup>

						<e-flex gap="6" alignItems="start" justifyContent="center" background="gray-100" radius="xl"
								padding="8">
							<e-flex width="col6" marginInline="auto" gap="4" justifyContent="center" direction="column">
								<e-flex alignItems="center" justifyContent="center" height="16">
									<e-heading level="3">Classic Elementor Widgets</e-heading>
								</e-flex>
								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="error" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">
										<b>Duplicated render Function (PHP + JS)</b><br> Each widget includes a PHP
										render function and a JS render function, written in a unique flavour of
										JS-in-PHP. This adds extra work, is hard to learn, test, maintain and extend
									</e-text>
								</e-flex>

								<e-text size="m">Elementor's current Button Widget render function:</e-text>

								<pre class="code-editor language-clike" style="--max-height: 20em">
										<textarea class="markup">
<?php
protected function render() {
	$settings = $this->get_settings_for_display();

	$this->add_render_attribute( 'wrapper', 'class', 'elementor-button-wrapper' );

	if ( ! empty( $settings['link']['url'] ) ) {
		$this->add_link_attributes( 'button', $settings['link'] );
		$this->add_render_attribute( 'button', 'class', 'elementor-button-link' );
	}

	$this->add_render_attribute( 'button', 'class', 'elementor-button' );
	$this->add_render_attribute( 'button', 'role', 'button' );

	if ( ! empty( $settings['button_css_id'] ) ) {
		$this->add_render_attribute( 'button', 'id', $settings['button_css_id'] );
	}

	if ( ! empty( $settings['size'] ) ) {
		$this->add_render_attribute( 'button', 'class', 'elementor-size-' . $settings['size'] );
	}

	if ( $settings['hover_animation'] ) {
		$this->add_render_attribute( 'button', 'class', 'elementor-animation-' . $settings['hover_animation'] );
	}
	?>
	<div <?php $this->print_render_attribute_string( 'wrapper' ); ?>>
		<a <?php $this->print_render_attribute_string( 'button' ); ?>>
			<?php $this->render_text(); ?>
		</a>
	</div>
	<?php
}

protected function render_text() {
	$settings = $this->get_settings_for_display();

	$migrated = isset( $settings['__fa4_migrated']['selected_icon'] );
	$is_new = empty( $settings['icon'] ) && Icons_Manager::is_migration_allowed();

	if ( ! $is_new && empty( $settings['icon_align'] ) ) {
		$settings['icon_align'] = $this->get_settings( 'icon_align' );
	}

	$this->add_render_attribute( [
		'content-wrapper' => [
			'class' => 'elementor-button-content-wrapper',
		],
		'icon-align' => [
			'class' => [
				'elementor-button-icon',
				'elementor-align-icon-' . $settings['icon_align'],
			],
		],
		'text' => [
			'class' => 'elementor-button-text',
		],
	] );

	$this->add_inline_editing_attributes( 'text', 'none' );
	?>
	<span <?php $this->print_render_attribute_string( 'content-wrapper' ); ?>>
		<?php if ( ! empty( $settings['icon'] ) || ! empty( $settings['selected_icon']['value'] ) ) : ?>
		<span <?php $this->print_render_attribute_string( 'icon-align' ); ?>>
			<?php if ( $is_new || $migrated ) :
				Icons_Manager::render_icon( $settings['selected_icon'], [ 'aria-hidden' => 'true' ] );
			else : ?>
				<i class="<?php echo esc_attr( $settings['icon'] ); ?>" aria-hidden="true"></i>
			<?php endif; ?>
		</span>
		<?php endif; ?>
		<span <?php $this->print_render_attribute_string( 'text' ); ?>><?php $this->print_unescaped_setting( 'text' ); ?></span>
	</span>
	<?php
}

protected function content_template() {
	?>
	<#
	view.addRenderAttribute( 'text', 'class', 'elementor-button-text' );
	view.addInlineEditingAttributes( 'text', 'none' );
	var iconHTML = elementor.helpers.renderIcon( view, settings.selected_icon, { 'aria-hidden': true }, 'i' , 'object' ),
		migrated = elementor.helpers.isIconMigrated( settings, 'selected_icon' );
	#>
	<div class="elementor-button-wrapper">
		<a id="{{ settings.button_css_id }}" class="elementor-button elementor-size-{{ settings.size }} elementor-animation-{{ settings.hover_animation }}" href="{{ settings.link.url }}" role="button">
			<span class="elementor-button-content-wrapper">
				<# if ( settings.icon || settings.selected_icon ) { #>
				<span class="elementor-button-icon elementor-align-icon-{{ settings.icon_align }}">
					<# if ( ( migrated || ! settings.icon ) && iconHTML.rendered ) { #>
						{{{ iconHTML.value }}}
					<# } else { #>
						<i class="{{ settings.icon }}" aria-hidden="true"></i>
					<# } #>
				</span>
				<# } #>
				<span {{{ view.getRenderAttributeString( 'text' ) }}}>{{{ settings.text }}}</span>
			</span>
		</a>
	</div>
<?php } ?>
										</textarea>
									</pre>
							</e-flex>

							<e-flex width="col8" marginInline="auto" gap="4" justifyContent="center" direction="column">
								<e-flex justifyContent="center">
									<img style="height: 64px" src="./img/web-components.svg"/>
								</e-flex>
								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="celery" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">
										<b>A single, simple render function </b><br> Lit templates, based on <a
											href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals">tagged
										template literals</a>, are simple, expressive and fast.
										Featuring HTML markup with native JavaScript expressions inline. No custom
										syntax to learn, no compilation required.
									</e-text>
								</e-flex>

								<e-text size="m">Equivalent Web Component render function:</e-text>

								<pre class="code-editor language-js" style="--max-height: 20em;">
render() {
	return html\`
		<div class="bg-layer"></div>
		<slot name="icon"></slot>
		<slot></slot>\`;
}
									</pre>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

				<!-- Markup -->
				<li class="splide__slide" data-splide-hash="markup">
					<e-flex maxWidth="7xl" marginInline="auto"
							padding="200" height="screen" gap="6" justifyContent="center" direction="column">
						<hgroup>
							<e-heading style="--ewc-heading-color: var(--ewc-color-gray-500)" level="3">Web Components
								vs Classic Widgets
							</e-heading>
							<e-heading level="1">Markup Quality</e-heading>
						</hgroup>

						<e-flex gap="6" alignItems="start" justifyContent="center" background="gray-100" radius="xl"
								padding="8">
							<e-flex width="col6" marginInline="auto" gap="4" justifyContent="center" direction="column">
								<e-flex alignItems="center" justifyContent="center" height="16">
									<e-heading level="3">Classic Elementor Widgets</e-heading>
								</e-flex>

								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="error" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">
										<b>Bloated markup with many long CSS classes</b><br>
										The markup is bloated and cumbersome with many long CSS classes, this makes the
										page large and difficult for humans to understand
									</e-text>
								</e-flex>

								<e-text size="m">Elementor's current Flip-Box Markup:</e-text>

								<pre class="code-editor language-html" style="--max-height: 20em">
<div class="elementor-element elementor-element-dd724d9 elementor-flip-box--effect-zoom-in elementor-widget elementor-widget-flip-box"
	data-id="dd724d9" data-element_type="widget" data-widget_type="flip-box.default">
	<div class="elementor-widget-container">
		<div class="elementor-flip-box">
			<div class="elementor-flip-box__layer elementor-flip-box__front">
				<div class="elementor-flip-box__layer__overlay">
					<div class="elementor-flip-box__layer__inner">
						<div class="elementor-icon-wrapper elementor-view-stacked elementor-shape-circle">
							<div class="elementor-icon">
								<i class="fas fa-star"></i>
							</div>
						</div>
						<h3 class="elementor-flip-box__layer__title">This is the heading</h3>
						<div class="elementor-flip-box__layer__description">
							Lorem ipsum dolor sit amet consectetur adipiscing elit dolor
						</div>
					</div>
				</div>
			</div>
			<div class="elementor-flip-box__layer elementor-flip-box__back">
				<div class="elementor-flip-box__layer__overlay">
					<div class="elementor-flip-box__layer__inner">
						<h3 class="elementor-flip-box__layer__title">This is the heading</h3>
						<div class="elementor-flip-box__layer__description">
							Lorem ipsum dolor sit amet consectetur adipiscing elit dolor
						</div>
						<a class="elementor-flip-box__button elementor-button elementor-size-sm" href="http://example.com/">
							Click Here
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
									</pre>
							</e-flex>

							<e-flex width="col6" marginInline="auto" gap="4" justifyContent="center" direction="column">
								<e-flex justifyContent="center">
									<img style="height: 64px" src="./img/web-components.svg"/>
								</e-flex>
								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="celery" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">
										<b>Minimalistic, clear, markup</b><br>
										By taking advantage of the shadow DOM, we can avoid extra elements required for
										the implementation.
										In addition, we don't need all the classes, since we have encapsulated style.
										Instead, we declare our properties using attributes.
									</e-text>
								</e-flex>

								<e-text size="m">Equivalent Web Component markup:</e-text>

								<pre class="code-editor language-html" style="--max-height: 20em">
<e-flip-box effect="zoom-in">
	<e-icon icon="fas-star" slot="icon"></e-icon>
	<h3 slot="title-front">This is the heading</h3>
	<div slot="description-front">
		Lorem ipsum dolor sit amet consectetur adipiscing elit dolor
	</div>
	<h3 slot="title-back">This is the heading</h3>
	<div slot="description-back">
		Lorem ipsum dolor sit amet consectetur adipiscing elit dolor
	</div>
	<a slot="button" href="http://example.com/">Click Here</a>
</e-flip-box>
									</pre>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

				<!-- Styling -->
				<li class="splide__slide" data-splide-hash="styling">
					<e-flex maxWidth="7xl" marginInline="auto"
							padding="200" height="screen" gap="6" justifyContent="center" direction="column">
						<hgroup>
							<e-heading style="--ewc-heading-color: var(--ewc-color-gray-500)" level="3">Web Components
								vs Classic Widgets
							</e-heading>
							<e-heading level="1">Styling</e-heading>
						</hgroup>

						<e-flex gap="6" alignItems="start" justifyContent="center" background="gray-100" radius="xl"
								padding="8">
							<e-flex width="col6" marginInline="auto" gap="4" justifyContent="center" direction="column">
								<e-flex alignItems="center" justifyContent="center" height="16">
									<e-heading level="3">Classic Elementor Widgets</e-heading>
								</e-flex>

								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="error" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">
										<b>Style is poorly managed and hard to maintain</b><br>
										CSS Selectors can become long due to specificity wars and name spacing. The
										widget is effected by CSS from several sources, scoping is hard to achieve and
										encapsulation is impossible.
									</e-text>
								</e-flex>

								<e-text size="m">Elementor's current Flip-Box Markup:</e-text>

								<pre class="code-editor language-css" style="--max-height: 20em">
.elementor-flip-box__back {
    background-color: #4054b2;
}

.elementor-flip-box--effect-zoom-in .elementor-flip-box .elementor-flip-box__back {
    opacity: 0;
    transform: scale(0.7);
}

.elementor-flip-box--effect-zoom-in .elementor-flip-box:hover .elementor-flip-box__back {
    opacity: 1;
    transform: scale(1);
}
</pre>
							</e-flex>

							<e-flex width="col6" marginInline="auto" gap="4" justifyContent="center" direction="column">
								<e-flex justifyContent="center">
									<img style="height: 64px" src="./img/web-components.svg"/>
								</e-flex>
								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="celery" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">
										<b>Style is integral, scoped and encapsulated</b><br>
										Each component includes its own style. Style is scoped and encapsulated by
										default. This keeps CSS selectors simple. Component’s styles don't affect — and
										aren't affected by — any other styles on the page.
									</e-text>
								</e-flex>

								<e-text size="m">Web component button selectors:</e-text>

								<pre class="code-editor language-css" style="--max-height: 20em">
.back {
    background-color: #4054b2;
}

:host([effect="zoom-in"]) .back {
    opacity: 0;
    transform: scale(0.7);
}

:host([effect="zoom-in"]:hover) .back {
    opacity: 1;
    transform: scale(1);
}
</pre>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

				<!-- Theming -->
				<li class="splide__slide playground" id="theming" data-splide-hash="theming">
					<e-flex maxWidth="7xl" marginInline="auto" gap="6" alignItems="center" justifyContent="center"
							height="screen" radius="xl" padding="8">
						<e-flex width="col6" gap="4" justifyContent="center" direction="column">
							<hgroup>
								<e-heading level="1">Theming / Design System</e-heading>
							</hgroup>

							<e-text size="m">Elementor's current Flip-Box Markup:</e-text>
							<pre class="code-editor live-code language-css" style="--max-height: 40em" data-result-element-id="themingDemo">
.custom-theme {
	--ewc-color-primary: #1473e6;
	--ewc-color-secondary: #01327d;
	--ewc-color-cta: #ce2783;
	--ewc-color-success: #268e6c;
	--ewc-color-warning: #da7b11;
	--ewc-color-danger: #d7373f;

	--ewc-size-radius-base: 0.25rem;
	--ewc-size-radius-none: 0;
	--ewc-size-radius-xxs: calc( var(--ewc-size-radius-base) * .5 );
	--ewc-size-radius-xs: calc( var(--ewc-size-radius-base) * .75 );
	--ewc-size-radius-s: calc( var(--ewc-size-radius-base) * 1 );
	--ewc-size-radius-m: calc( var(--ewc-size-radius-base) * 1.5 );
	--ewc-size-radius-l: calc( var(--ewc-size-radius-base) * 2 );
	--ewc-size-radius-xl: calc( var(--ewc-size-radius-base) * 3 );
	--ewc-size-radius-xxl: calc( var(--ewc-size-radius-base) * 4 );
}
</pre>
						</e-flex>
						<style id="themingDemo" class="result"></style>
						<e-flex maxWidth="col6" gap="4" direction="column" padding="8" radius="xxl"
								background="gray-300" class="custom-theme">
							<e-flex gap="4">
								<e-box background="gray-50" width="col6" elevation="card" radius="xl" overflow="hidden">
									<e-box padding="5">
										<e-heading level="3">Demo Card</e-heading>
										<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur ducimus
											id. Bondage is born
											empathy has been excluded.</p>
									</e-box>
								</e-box>

								<e-box background="gray-50" width="col6" elevation="card" radius="xl" overflow="hidden">
									<e-box padding="5">
										<e-heading level="3">Very good news</e-heading>
										<p>Yes, it is possible to exterminate the things that can destroy us, but not
											without coherence. Consequatur ducimus id.</p>
									</e-box>
								</e-box>
							</e-flex>

							<e-flex gap="4">
								<e-box borderWidth="thick" borderColor="primary" background="gray-50" width="col6"
									   elevation="card" radius="l" overflow="hidden">
									<e-box padding="5">
										<e-heading level="3" color="primary">Create account</e-heading>
										<p>Yes, it is possible to exterminate the things that can destroy us, but not
											without coherence.</p>
										<e-flex justifyContent="end" gap="2">
											<e-button color="secondary">Read More</e-button>
											<e-button color="primary">Start</e-button>
										</e-flex>
									</e-box>
								</e-box>

								<e-flex padding="5" borderWidth="thin" borderColor="danger" background="gray-50"
										width="col6"
										direction="column" elevation="card" radius="l" overflow="hidden">
									<e-box>
										<e-heading level="3" color="danger">Delete account</e-heading>
										<p>To start having the best Lorem ipsum dolor sit amet, consectetur adi pisicing
											elit.</p>
									</e-box>

									<e-flex justifyContent="end" gap="2" marginTop="auto">
										<e-button color="default">Cancel</e-button>
										<e-button color="danger">Delete</e-button>
									</e-flex>
								</e-flex>
							</e-flex>

							<e-flex gap="4">
								<e-flex padding="5" background="gray-50" width="col6"
										direction="column" elevation="panel" radius="m" overflow="hidden">
									<e-box>
										<e-heading level="3" color="indigo">Create account</e-heading>
										<p>To start having the best Lorem ipsum dolor sit amet, consectetur adi pisicing
											elit.</p>
									</e-box>
									<e-box marginTop="auto">
										<e-button color="indigo">Start</e-button>
									</e-box>
								</e-flex>

								<e-box borderWidth="thick" borderColor="warning" background="gray-50" width="col6"
									   elevation="card" radius="m" overflow="hidden">
									<e-box padding="5">
										<e-heading level="3" color="warning">Updates available</e-heading>
										<p>Yes, it is possible to exterminate the things that can destroy us, but not
											without coherence. Consequatur ducimus id!</p>
										<e-flex justifyContent="end" gap="2">
											<e-button color="default">Backup</e-button>
											<e-button color="warning">Update</e-button>
										</e-flex>
									</e-box>
								</e-box>
							</e-flex>
						</e-flex>

					</e-flex>
				</li>

				<!-- Reactivity -->
				<li class="splide__slide" data-splide-hash="reactivity">
					<e-flex maxWidth="7xl" marginInline="auto"
							padding="200" height="screen" gap="6" justifyContent="center" direction="column">
						<hgroup>
							<e-heading style="--ewc-heading-color: var(--ewc-color-gray-500)" level="3">Web Components
								vs Classic Widgets
							</e-heading>
							<e-heading level="1">Reactivity / Interactivity</e-heading>
						</hgroup>

						<e-flex gap="6" alignItems="start" justifyContent="center" background="gray-100" radius="xl"
								padding="8">
							<e-flex maxWidth="col6" marginInline="auto" gap="4" justifyContent="center"
									direction="column">
								<e-flex alignItems="center" justifyContent="center" height="16">
									<e-heading level="3">Classic Elementor Widgets</e-heading>
								</e-flex>

								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="error" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="m">
										<b>Interactivity, Reactivity hard to achieve</b><br>
										<ul>
											<li>A separate JavaScript "handler" is required.</li>
											<li>The handler depends on a monolithic app and it's build process.</li>
											<li>Other supporting systems are required for the handler to load and
												associate with the relevant widgets.
											</li>
											<li>Handler uses old-school references to the elements it handles and their
												settings.
											</li>
										</ul>
									</e-text>
								</e-flex>

								<e-text size="m">Elementor style jQuery counter handler ("OOP Style")</e-text>


								<sp-theme scale="medium" color="light">
									<sp-accordion allow-multiple>
										<sp-accordion-item open label="JavaScript">
										<pre class="code-editor live-code language-js" style="--max-height: 40em">
											<textarea class="markup">
class Counter {
	constructor( elementSelector ) {
		this.$el = jQuery( elementSelector );
		this.bindEvents();
	}

	get elements() {
		const $el = this.$el;

		return {
			btnPlus: $el.find( '.elementor-counter__plus-button' ),
			btnMinus: $el.find( '.elementor-counter__minus-button' ),
			counter: $el.find( '.elementor-counter__counter' ),
		}
	}

	get count() {
		const $counter = this.elements.counter;
		return Number( $counter.text() );
	}

	increment() {
		const $counter = this.elements.counter;
		$counter.text( this.count + 1 );
	}

	decrement() {
		const $counter = this.elements.counter;
		$counter.text( this.count - 1 );
	}

	bindEvents = () => {
		const $buttonPlus = this.elements.btnPlus;
		const $buttonMinus = this.elements.btnMinus;

		$buttonPlus.on( 'click', () => {
			this.increment();
		} );

		$buttonMinus.on( 'click', () => {
			this.decrement();
		} );
	}
}

const counter = new Counter( '#id-xxx' );

											</textarea>
										</pre>
										</sp-accordion-item>
										<sp-accordion-item label="HTML">
										<pre class="code-editor live-code language-html" style="--max-height: 20em">
											<textarea class="markup">
<div class="elementor-counter elementor-widget" id="uid-xxx">
	<h3 class="elementor-counter__title">Count:
		<span class="elementor-counter__counter"/>0</span>
	</h3>
	<div class="elementor-counter__buttons-wrapper">
		<button class="elementor-counter__minus-button">-</button>
		<button class="elementor-counter__plus-button">+</button>
	</div>
</div>
											</textarea>
										</pre>
										</sp-accordion-item>
									</sp-accordion>
								</sp-theme>
							</e-flex>

							<e-flex maxWidth="col6" marginInline="auto" gap="4" justifyContent="center"
									direction="column">
								<e-flex justifyContent="center">
									<img style="height: 64px" src="./img/web-components.svg"/>
								</e-flex>
								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="celery" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">

										<e-text size="m">
											<b>Reactive and Stateful out of the box</b><br>
											Declare reactive properties to model your component’s API and internal
											state.<br>
											The component re-renders whenever a reactive property (or corresponding HTML
											attribute) changes.
										</e-text>
									</e-text>
								</e-flex>

								<e-text size="m">Lit Web component Counter:</e-text>
								<sp-theme scale="medium" color="light">
								<sp-accordion allow-multiple>
									<sp-accordion-item label="JavaScript">
										<pre class="code-editor live-code language-js" style="--max-height: 20em">
											<textarea class="markup">
import { html, LitElement } from 'lit';

class Counter extends LitElement {
  static properties = {
    count: { state: true }
  };

  constructor() {
    super();
    this.count = 0;
  }

  render() {
    return html\`
      <h3>Count\: \${this.count}</h3>
      <button @click=\${ () => this.count-- }>-</button>
      <button @click=\${ () => this.count++ }>+</button>
    \`;
  }
}

customElements.define( 'my-counter', Counter );
											</textarea>
										</pre>
									</sp-accordion-item>
									<sp-accordion-item label="HTML">
										<pre class="code-editor live-code language-html" style="--max-height: 40em">
											<textarea class="markup">
<my-counter></my-counter>
											</textarea>
										</pre>
									</sp-accordion-item>
								</sp-accordion>
								</sp-theme>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

				<!-- Go Headless -->
				<li class="splide__slide" data-splide-hash="headless">
					<e-flex maxWidth="7xl" marginInline="auto"
							padding="200" height="screen" gap="6" justifyContent="center" direction="column">
						<e-heading level="1">Go Headless</e-heading>

						<e-flex gap="6" alignItems="start" justifyContent="center" background="gray-100" radius="xl"
								padding="8">
							<e-flex maxWidth="col6" marginInline="auto" gap="4" justifyContent="center"
									direction="column">
								<e-flex alignItems="center" justifyContent="center" height="16">
									<e-heading level="3">Classic Elementor Widgets</e-heading>
								</e-flex>

								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="error" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="m">
										<b>Heavily depend on server for rendering</b><br>
										Currently, the whole process of rendering a widget requires many server
										processes.
										Each elementor template is saved as a JSON object in the WordPress DB, this data
										gets interpreted
										by PHP using Elementor's PHP templates. The result is HTML and CSS rendered and
										sent to the visitors.
									</e-text>
								</e-flex>

								<e-text size="m">A chunk of Elementor's JSON data representing a couple of widgets
								</e-text>
								<pre class="code-editor language-js" style="--max-height: 20em">
"elements": [
  {
	"id": "e2d42c9",
	"elType": "widget",
	"settings": {
	  "button_type": "warning",
	  "text": "Click here",
	  "link": {
		"url": "https:\\/\\/example.com\\/",
		"is_external": "",
		"nofollow": "",
		"custom_attributes": ""
	  },
	  "size": "xs",
	  "selected_icon": {
		"value": "far fa-check-circle",
		"library": "fa-regular"
	  },
	  "__globals__": {
		"background_color": ""
	  }
	},
	"elements": [

	],
	"widgetType": "button"
  },
  {
	"id": "dd724d9",
	"elType": "widget",
	"settings": {
	  "icon_view": "stacked",
	  "title_text_a": "This is the heading",
	  "description_text_a": "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor",
	  "background_a_background": "classic",
	  "title_text_b": "This is the heading",
	  "description_text_b": "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor",
	  "button_text": "Click Here",
	  "link": {
		"url": "http:\\/\\/example.com\\/",
		"is_external": "",
		"nofollow": "",
		"custom_attributes": ""
	  },
	  "flip_effect": "zoom-in"
	},
	"elements": [

	],
	"widgetType": "flip-box"
  }
]
</pre>
							</e-flex>

							<e-flex maxWidth="col6" marginInline="auto" gap="4" justifyContent="center"
									direction="column">
								<e-flex justifyContent="center">
									<img style="height: 64px" src="./img/web-components.svg"/>
								</e-flex>
								<e-flex height="40" alignItems="center" gap="5" padding="6" radius="l" elevation="card"
										background="gray-50">
									<div>
										<e-icon color="celery" size="m" circular stacked>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16"
												 viewBox="0 0 12 16">
												<path fill-rule="evenodd"
													  d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
											</svg>
										</e-icon>
									</div>
									<e-text size="l">

										<e-text size="m">
											<b>Doesn't require server side processing</b><br>
											Web Components are represented as HTML containing all the data required to
											render.
											The markup is interpreted by the browser, without depending on any
											server-side processing.
											This can allow the use of Elementor elements in many new environments like
											<a href="https://jamstack.org/generators/" target="_blank">site
												generators</a> and <a href="https://jamstack.org/headless-cms/"
																	  target="_blank">headless CMS solutions</a> that
											are growing in popularity in this age of <a
												href="https://jamstack.org/what-is-jamstack/"
												target="_blank">Jamstack</a> architecture.
										</e-text>
									</e-text>
								</e-flex>

								<e-text size="m">Same data saved as HTML:</e-text>
								<pre class="code-editor language-html" style="--max-height: 20em">
<e-button size="mini" color="warning">
	<e-icon icon="fas-star" stacked slot="icon"></e-icon>
	<a href="https://example.com/">Click here</a>
</e-button>

<e-flip-box effect="zoom-in">
	<e-icon icon="fas-star" stacked slot="icon"></e-icon>
	<h3 slot="title-front">This is the heading</h3>
	<div slot="description-front">
		Lorem ipsum dolor sit amet consectetur adipiscing elit dolor
	</div>
	<h3 slot="title-back">This is the heading</h3>
	<div slot="description-back">
		Lorem ipsum dolor sit amet consectetur adipiscing elit dolor
	</div>
	<a slot="button" href="https://example.com/">Click Here</a>
</e-flip-box>


<!-- Example of possible posts component. The component can retrieve the posts
	via the REST API and display each one in a list or a grid -->
<e-wp-posts count="5" author="5" term="3" skin="cards"></e-wp-posts>
</pre>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

				<!-- Social Validation -->
				<li class="splide__slide" data-splide-hash="social-validation">
					<e-flex maxWidth="7xl" marginInline="auto" padding="200" height="screen" gap="6"
							justifyContent="center" direction="column">
						<e-heading level="1">Social Validation</e-heading>
						<e-flex gap="6" alignItems="start" justifyContent="center" radius="xl" padding="8">
							<e-flex maxWidth="col2" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://github.com/github/github-elements" target="_blank">
									<img src="./img/logos/github-2.svg" alt="GitHub Web Components">
								</a>
							</e-flex>
							<e-flex maxWidth="col2" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://www.webcomponents.org/collection/GoogleWebComponents/google-web-components" target="_blank">
									<img src="./img/logos/google-2015.svg" alt="">
								</a>
							</e-flex>
							<e-flex maxWidth="col2" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://web-components.carbondesignsystem.com/" target="_blank">
									<img src="./img/logos/ibm.svg" alt="">
								</a>
							</e-flex>
							<e-flex maxWidth="col2" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://explore.fast.design/components/fast-accordion" target="_blank">
									<img src="./img/logos/microsoft.svg" alt="">
								</a>
							</e-flex>
						</e-flex>
						<e-flex gap="6" alignItems="start" justifyContent="center" radius="xl" padding="8">
							<e-flex maxWidth="col1" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://opensource.adobe.com/spectrum-web-components/" target="_blank">
									<img src="./img/logos/adobe-2.svg" alt="">
								</a>
							</e-flex>
							<e-flex maxWidth="col3" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://ux.redhat.com/components/" target="_blank">
									<img src="./img/logos/red-hat.svg" alt="Redhat Web Components">
								</a>
							</e-flex>
							<e-flex maxWidth="col2" marginInline="auto" gap="4" justifyContent="center">
								<img src="./img/logos/youtube-2.svg" alt="">
							</e-flex>
							<e-flex maxWidth="col2" marginInline="auto" gap="4" justifyContent="center">
								<a href="https://developer.salesforce.com/docs/component-library/overview/components" target="_blank">
									<img src="./img/logos/salesforce.svg" alt="">
								</a>
							</e-flex>
						</e-flex>
					</e-flex>
				</li>

			</ul>
		</div>
	</div>
`;
