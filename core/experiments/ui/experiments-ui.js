( function () {
	'use strict';

	const cfg = window.ElementorExperimentsUi;
	if ( ! cfg || ! Array.isArray( cfg.features ) ) return;

	const i18n = cfg.i18n;

	document.body.classList.add( 'e-exp-ui-active' );

	const root = document.createElement( 'div' );
	root.className = 'e-exp-ui';
	root.innerHTML = renderShell();
	const wrap = document.querySelector( '#wpbody-content .wrap' ) || document.querySelector( '#wpbody-content' );
	const anchor = wrap.querySelector( '.nav-tab-wrapper' ) || wrap.querySelector( 'h1' );
	if ( anchor && anchor.parentNode === wrap ) {
		anchor.insertAdjacentElement( 'afterend', root );
	} else {
		wrap.prepend( root );
	}

	const indicator = root.querySelector( '[data-indicator]' );
	const indicatorText = indicator.querySelector( '.text' );
	const toasts = document.createElement( 'div' );
	toasts.className = 'e-exp-ui-toasts';
	toasts.setAttribute( 'aria-live', 'polite' );
	document.body.appendChild( toasts );

	const state = new Map( cfg.features.map( ( f ) => [ f.name, f ] ) );

	renderCards();
	wireToolbar();
	refreshCounts();

	function renderShell() {
		return `
			<header class="e-exp-ui-header">
				<div>
					<h1>Experiments</h1>
					<p>Toggles save automatically. Some experiments require a page reload to fully apply.</p>
				</div>
				<div class="e-exp-ui-indicator" data-indicator>
					<span class="dot"></span><span class="text">${ escapeHtml( i18n.saved ) }</span>
				</div>
			</header>
			<div class="e-exp-ui-toolbar">
				<label class="e-exp-ui-search">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
					<input type="search" data-search placeholder="${ escapeHtml( i18n.searchPlaceholder ) }" />
				</label>
				<div class="e-exp-ui-filters" role="tablist">
					<button class="e-exp-ui-filter active" data-filter="all">${ escapeHtml( i18n.filterAll ) } <span class="count">0</span></button>
					<button class="e-exp-ui-filter" data-filter="active">${ escapeHtml( i18n.filterActive ) } <span class="count">0</span></button>
					<button class="e-exp-ui-filter" data-filter="inactive">${ escapeHtml( i18n.filterInactive ) } <span class="count">0</span></button>
				</div>
				<div class="e-exp-ui-bulk">
					<button class="e-exp-ui-bulk-btn" data-bulk="active">${ escapeHtml( i18n.activateAll ) }</button>
					<button class="e-exp-ui-bulk-btn" data-bulk="inactive">${ escapeHtml( i18n.deactivateAll ) }</button>
					<button class="e-exp-ui-bulk-btn" data-bulk="default">${ escapeHtml( i18n.resetAll ) }</button>
				</div>
			</div>
			<div data-groups></div>
			<div class="e-exp-ui-empty" data-empty>${ escapeHtml( i18n.noResults ) }</div>
		`;
	}

	function renderCards() {
		const groupsEl = root.querySelector( '[data-groups]' );
		const groups = { ongoing: [], stable: [] };
		for ( const f of state.values() ) {
			( f.releaseStatus === 'stable' ? groups.stable : groups.ongoing ).push( f );
		}

		const order = [
			{ key: 'ongoing', label: i18n.ongoing, items: groups.ongoing },
			{ key: 'stable',  label: i18n.stable,  items: groups.stable },
		];

		groupsEl.innerHTML = order
			.filter( ( g ) => g.items.length )
			.map( ( g ) => `
				<section class="e-exp-ui-group" data-group="${ g.key }">
					<div class="e-exp-ui-group-header"><h2>${ escapeHtml( g.label ) }</h2><span class="line"></span></div>
					<div class="e-exp-ui-cards">${ g.items.map( renderCard ).join( '' ) }</div>
				</section>
			` )
			.join( '' );

		root.querySelectorAll( '[data-card]' ).forEach( ( card ) => {
			const input = card.querySelector( 'input[type="checkbox"]' );
			input.addEventListener( 'change', () => onToggle( card, input ) );

			const resetBtn = card.querySelector( '[data-reset]' );
			if ( resetBtn ) {
				resetBtn.addEventListener( 'click', () => onReset( card ) );
			}
		} );
	}

	function renderCard( f ) {
		const isActive = f.actualState === 'active';
		return `
			<article class="e-exp-ui-card" data-card data-name="${ escapeHtml( f.name ) }" data-state="${ isActive ? 'active' : 'inactive' }">
				<div class="e-exp-ui-card-main">
					<div class="e-exp-ui-card-title-row">
						<h3 class="e-exp-ui-card-title">${ escapeHtml( f.title ) }</h3>
						<span class="e-exp-ui-badge ${ escapeHtml( f.releaseStatus ) }">${ escapeHtml( f.releaseStatus ) }</span>
						${ f.isHidden ? `<span class="e-exp-ui-badge hidden">Hidden</span>` : '' }
						${ ( f.tags || [] ).map( ( t ) => `<span class="e-exp-ui-badge tag">${ escapeHtml( t.label ) }</span>` ).join( '' ) }
					</div>
					<p class="e-exp-ui-card-desc">${ f.description || '' }</p>
					${ renderMeta( f ) }
				</div>
				<div class="e-exp-ui-actions">
					<div class="e-exp-ui-state-col">
						<span class="e-exp-ui-state ${ isActive ? 'active' : 'inactive' }" data-state-label>${ isActive ? escapeHtml( i18n.filterActive ) : escapeHtml( i18n.filterInactive ) }</span>
						<button class="e-exp-ui-reset" data-reset type="button" ${ isAtDefault( f ) ? 'hidden' : '' }>${ escapeHtml( i18n.resetToDefault ) }</button>
					</div>
					<label class="e-exp-ui-toggle">
						<input type="checkbox" ${ isActive ? 'checked' : '' } aria-label="Toggle ${ escapeHtml( f.title ) }" />
						<span class="track"><span class="thumb"></span></span>
					</label>
				</div>
			</article>
		`;
	}

	function renderMeta( f ) {
		const parts = [];
		if ( f.dependencies && f.dependencies.length ) {
			parts.push( `<span><strong>${ escapeHtml( i18n.requires ) }:</strong> ${ f.dependencies.map( ( d ) => escapeHtml( d.title ) ).join( ', ' ) }</span>` );
		}
		if ( f.dependents && f.dependents.length ) {
			parts.push( `<span><strong>${ escapeHtml( i18n.requiredBy ) }:</strong> ${ f.dependents.map( ( d ) => escapeHtml( d.title ) ).join( ', ' ) }</span>` );
		}
		return parts.length ? `<div class="e-exp-ui-card-meta">${ parts.join( '' ) }</div>` : '';
	}

	async function onToggle( card, input ) {
		const name = card.dataset.name;
		const prevChecked = ! input.checked;
		const nextState = input.checked ? 'active' : 'inactive';

		card.classList.add( 'saving' );
		card.classList.remove( 'just-saved' );
		setIndicator( 'saving', i18n.saving );

		try {
			const res = await apiFetch( { name, state: nextState } );
			applyServerResult( res );
			card.classList.remove( 'saving' );
			card.classList.add( 'just-saved' );
			setIndicator( 'saved', i18n.saved );
			setTimeout( () => card.classList.remove( 'just-saved' ), 1200 );

			const feature = state.get( name );
			toast( `${ feature.title } ${ res.actualState === 'active' ? 'enabled' : 'disabled' }`, {
				undo: () => {
					input.checked = prevChecked;
					input.dispatchEvent( new Event( 'change' ) );
				},
			} );

			if ( res.cascaded && res.cascaded.length ) {
				const names = res.cascaded.map( ( c ) => c.title ).join( ', ' );
				toast( `${ i18n.cascadeMessage } ${ names }`, { duration: 5000 } );
			}

			refreshCounts();
		} catch ( err ) {
			input.checked = prevChecked;
			card.classList.remove( 'saving' );
			setIndicator( 'error', i18n.saveFailed );
			toast( i18n.saveFailed + ( err && err.message ? ': ' + err.message : '' ), { error: true } );
			setTimeout( () => setIndicator( 'saved', i18n.saved ), 2500 );
		}
	}

	async function onReset( card, opts = {} ) {
		const name = card.dataset.name;
		const feature = state.get( name );
		if ( ! feature ) return;
		const prevState = feature.state;
		const prevActual = feature.actualState;

		card.classList.add( 'saving' );
		card.classList.remove( 'just-saved' );
		setIndicator( 'saving', i18n.saving );

		try {
			const res = await apiFetch( { name, state: 'default' } );
			applyServerResult( res );
			card.classList.remove( 'saving' );
			card.classList.add( 'just-saved' );
			setIndicator( 'saved', i18n.saved );
			setTimeout( () => card.classList.remove( 'just-saved' ), 1200 );

			if ( ! opts.silent ) {
				toast( `${ feature.title }: ${ i18n.resetDone }`, {
					undo: () => onManualSet( card, prevState, prevActual ),
				} );
			}
			refreshCounts();
		} catch ( err ) {
			card.classList.remove( 'saving' );
			setIndicator( 'error', i18n.saveFailed );
			toast( i18n.saveFailed + ( err && err.message ? ': ' + err.message : '' ), { error: true } );
			setTimeout( () => setIndicator( 'saved', i18n.saved ), 2500 );
		}
	}

	async function bulkSet( targetState ) {
		const confirmMap = {
			active: i18n.activateAllConfirm,
			inactive: i18n.deactivateAllConfirm,
			default: i18n.resetAllConfirm,
		};
		if ( ! window.confirm( confirmMap[ targetState ] ) ) return;

		const targetCards = [];
		const targetNames = [];
		root.querySelectorAll( '[data-card]' ).forEach( ( card ) => {
			const feature = state.get( card.dataset.name );
			if ( ! feature ) return;

			const alreadyAtTarget = targetState === 'default'
				? isAtDefault( feature )
				: feature.actualState === targetState && ! isAtDefault( feature );

			if ( alreadyAtTarget ) return;
			targetCards.push( card );
			targetNames.push( feature.name );
		} );

		if ( ! targetNames.length ) return;

		targetCards.forEach( ( card ) => card.classList.add( 'saving' ) );
		setIndicator( 'saving', i18n.saving );

		try {
			const res = await bulkApiFetch( { names: targetNames, state: targetState } );

			for ( const item of res.updated || [] ) {
				const feature = state.get( item.name );
				if ( feature ) {
					feature.state = item.state;
					feature.actualState = item.actualState;
					updateCard( item.name, item.actualState, item.state );
				}
			}
			for ( const item of res.cascaded || [] ) {
				const feature = state.get( item.name );
				if ( feature ) {
					feature.state = item.state;
					feature.actualState = item.actualState;
					updateCard( item.name, item.actualState, item.state );
				}
			}

			targetCards.forEach( ( card ) => {
				card.classList.remove( 'saving' );
				card.classList.add( 'just-saved' );
				setTimeout( () => card.classList.remove( 'just-saved' ), 1200 );
			} );

			refreshCounts();

			if ( res.errors && res.errors.length ) {
				setIndicator( 'error', i18n.saveFailed );
				toast( `${ res.errors.length } ${ i18n.saveFailed }`, { error: true } );
				setTimeout( () => setIndicator( 'saved', i18n.saved ), 2500 );
			} else {
				setIndicator( 'saved', i18n.saved );
			}
		} catch ( err ) {
			targetCards.forEach( ( card ) => card.classList.remove( 'saving' ) );
			setIndicator( 'error', i18n.saveFailed );
			toast( i18n.saveFailed + ( err && err.message ? ': ' + err.message : '' ), { error: true } );
			setTimeout( () => setIndicator( 'saved', i18n.saved ), 2500 );
		}
	}

	function bulkApiFetch( body ) {
		return fetch( cfg.restUrl + '/bulk', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': cfg.nonce,
			},
			body: JSON.stringify( body ),
		} ).then( async ( res ) => {
			const data = await res.json().catch( () => ( {} ) );
			if ( ! res.ok ) {
				throw new Error( data && data.message ? data.message : `HTTP ${ res.status }` );
			}
			return data;
		} );
	}

	async function onManualSet( card, targetState, targetActual ) {
		const name = card.dataset.name;
		try {
			const res = await apiFetch( { name, state: targetState } );
			applyServerResult( res );
		} catch ( err ) {
			toast( i18n.saveFailed, { error: true } );
		}
	}

	function applyServerResult( res ) {
		const target = state.get( res.name );
		if ( target ) {
			target.state = res.state;
			target.actualState = res.actualState;
			updateCard( res.name, res.actualState, res.state );
		}
		for ( const c of res.cascaded || [] ) {
			const f = state.get( c.name );
			if ( f ) {
				f.state = c.state;
				f.actualState = c.actualState;
				updateCard( c.name, c.actualState, c.state );
			}
		}
	}

	function updateCard( name, actualState, rawState ) {
		const card = root.querySelector( `[data-card][data-name="${ CSS.escape( name ) }"]` );
		if ( ! card ) return;
		const input = card.querySelector( 'input[type="checkbox"]' );
		const label = card.querySelector( '[data-state-label]' );
		const resetBtn = card.querySelector( '[data-reset]' );
		const isActive = actualState === 'active';
		input.checked = isActive;
		card.dataset.state = isActive ? 'active' : 'inactive';
		label.textContent = isActive ? i18n.filterActive : i18n.filterInactive;
		label.classList.toggle( 'active', isActive );
		label.classList.toggle( 'inactive', ! isActive );
		if ( resetBtn ) {
			const feature = state.get( name );
			resetBtn.hidden = ! feature || isAtDefault( feature );
		}
	}

	function isAtDefault( f ) {
		if ( f.state === 'default' ) return true;
		return f.state === f.default;
	}

	function wireToolbar() {
		const search = root.querySelector( '[data-search]' );
		const filters = root.querySelectorAll( '[data-filter]' );
		const bulkBtns = root.querySelectorAll( '[data-bulk]' );
		let currentFilter = 'all';

		bulkBtns.forEach( ( btn ) => btn.addEventListener( 'click', () => bulkSet( btn.dataset.bulk ) ) );

		filters.forEach( ( btn ) =>
			btn.addEventListener( 'click', () => {
				filters.forEach( ( b ) => b.classList.remove( 'active' ) );
				btn.classList.add( 'active' );
				currentFilter = btn.dataset.filter;
				applyFilter();
			} )
		);
		search.addEventListener( 'input', applyFilter );

		function applyFilter() {
			const q = search.value.trim().toLowerCase();
			let visible = 0;
			root.querySelectorAll( '.e-exp-ui-group' ).forEach( ( group ) => {
				let groupVisible = 0;
				group.querySelectorAll( '[data-card]' ).forEach( ( card ) => {
					const matchesQuery = ! q || card.textContent.toLowerCase().includes( q );
					const matchesFilter = currentFilter === 'all' || card.dataset.state === currentFilter;
					const show = matchesQuery && matchesFilter;
					card.style.display = show ? '' : 'none';
					if ( show ) { visible++; groupVisible++; }
				} );
				group.style.display = groupVisible ? '' : 'none';
			} );
			root.querySelector( '[data-empty]' ).classList.toggle( 'show', visible === 0 );
		}
	}

	function refreshCounts() {
		const cards = root.querySelectorAll( '[data-card]' );
		const total = cards.length;
		let active = 0;
		cards.forEach( ( c ) => { if ( c.dataset.state === 'active' ) active++; } );
		root.querySelector( '[data-filter="all"] .count' ).textContent = total;
		root.querySelector( '[data-filter="active"] .count' ).textContent = active;
		root.querySelector( '[data-filter="inactive"] .count' ).textContent = total - active;
	}

	function setIndicator( mode, text ) {
		indicator.classList.remove( 'saving', 'error' );
		if ( mode !== 'saved' ) indicator.classList.add( mode );
		indicatorText.textContent = text;
	}

	function toast( msg, opts = {} ) {
		const el = document.createElement( 'div' );
		el.className = 'e-exp-ui-toast' + ( opts.error ? ' error' : '' );
		el.innerHTML = `<span>${ escapeHtml( msg ) }</span>` + ( opts.undo ? ` <button class="undo">${ escapeHtml( i18n.undo ) }</button>` : '' );
		toasts.appendChild( el );
		requestAnimationFrame( () => el.classList.add( 'show' ) );
		const dismiss = () => { el.classList.remove( 'show' ); setTimeout( () => el.remove(), 200 ); };
		if ( opts.undo ) el.querySelector( '.undo' ).addEventListener( 'click', () => { opts.undo(); dismiss(); } );
		setTimeout( dismiss, opts.duration || 3500 );
	}

	function apiFetch( body ) {
		return fetch( cfg.restUrl + '/toggle', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': cfg.nonce,
			},
			body: JSON.stringify( body ),
		} ).then( async ( res ) => {
			const data = await res.json().catch( () => ( {} ) );
			if ( ! res.ok ) {
				const msg = data && data.message ? data.message : `HTTP ${ res.status }`;
				throw new Error( msg );
			}
			return data;
		} );
	}

	function escapeHtml( s ) {
		return String( s ?? '' ).replace( /[&<>"']/g, ( c ) => ( { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ c ] ) );
	}
} )();
