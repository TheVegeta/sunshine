(function () {
  function q(sel) { return document.querySelector(sel); }

  function renderNotFound() {
    const wrap = q('#product-detail');
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32 text-center">
        <p class="eyebrow mb-5">Piece not found</p>
        <h1 class="serif text-5xl md:text-7xl mb-6">This piece has wandered off.</h1>
        <p class="text-muted mb-10">The piece you're looking for may have moved or is no longer listed.</p>
        <a href="collections.html" class="btn btn-solid">Back to Collections</a>
      </div>`;
  }

  function productCard(p) {
    return `
      <article class="reveal">
        <a href="product.html?id=${p.id}" class="block group no-underline text-inherit">
          <div class="img-frame aspect-[3/4] mb-5">
            <img src="${p.image.replace('w=1400', 'w=900')}" alt="${p.alt}" loading="lazy" width="900" height="1200">
          </div>
          <p class="eyebrow mb-2">${p.label}</p>
          <h3 class="serif text-2xl md:text-3xl">${p.title}</h3>
        </a>
      </article>`;
  }

  function initProductDetail() {
    const wrap = q('#product-detail');
    if (!wrap) return;
    const products = window.SUNSHINE_PRODUCTS || [];
    const getById = window.getSunshineProductById || ((id) => products.find(p => p.id === id));
    const id = new URLSearchParams(window.location.search).get('id');
    const product = getById(id);

    if (!product) {
      // If opened without id, show first product for a useful page.
      if (!id && products.length) {
        window.location.replace(`product.html?id=${products[0].id}`);
        return;
      }
      renderNotFound();
      return;
    }

    document.title = `${product.title} — Sunshine Handmade Jewelry`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', product.desc);

    const pageUrl = `https://thevegeta.github.io/sunshine/product.html?id=${product.id}`;
    const setMeta = (selector, attr, value) => { const el = document.querySelector(selector); if (el) el.setAttribute(attr, value); };
    setMeta('link[rel="canonical"]', 'href', pageUrl);
    setMeta('meta[property="og:title"]', 'content', `${product.title} — Sunshine Handmade Jewelry`);
    setMeta('meta[property="og:description"]', 'content', product.desc);
    setMeta('meta[property="og:url"]', 'content', pageUrl);
    setMeta('meta[property="og:image"]', 'content', product.image);
    setMeta('meta[property="og:image:alt"]', 'content', product.alt);
    setMeta('meta[name="twitter:title"]', 'content', `${product.title} — Sunshine Handmade Jewelry`);
    setMeta('meta[name="twitter:description"]', 'content', product.desc);
    setMeta('meta[name="twitter:image"]', 'content', product.image);

    let ld = document.getElementById('product-jsonld');
    if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'product-jsonld'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.desc,
      image: [product.image],
      category: product.label,
      brand: { '@type': 'Brand', name: 'Sunshine Handmade Jewelry' },
      url: pageUrl
    });

    const related = products.filter(p => p.id !== product.id).slice(0, 3);
    wrap.innerHTML = `
      <section class="px-6 md:px-10 pt-32 md:pt-40 pb-16 md:pb-24">
        <div class="max-w-[1400px] mx-auto">
          <a href="collections.html" class="arrow-link mb-10 inline-flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="transform:rotate(225deg)"><path d="M7 17 17 7M7 7h10v10"/></svg> Back to collections</a>
          <div class="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div class="md:col-span-7 reveal">
              <div class="img-frame aspect-[4/5] bg-stonewarm/30 border border-[var(--line)]">
                <img src="${product.image}" alt="${product.alt}" width="1400" height="1750" class="w-full h-full object-cover">
              </div>
            </div>
            <div class="md:col-span-5 reveal reveal-delay-1 md:sticky md:top-28">
              <p class="eyebrow mb-4">${product.label}</p>
              <h1 class="serif text-4xl md:text-6xl leading-[1.02] tracking-tight mb-6">${product.title}</h1>
              <p class="text-muted leading-relaxed mb-8 text-lg">${product.desc}</p>
              <div class="line-grow visible mb-8"></div>
              <p class="text-muted leading-relaxed mb-10">${product.details}</p>
              <dl class="space-y-5 mb-10">
                <div class="grid grid-cols-[130px,1fr] gap-4 pb-5 border-b border-[var(--line)]"><dt class="eyebrow !text-[0.66rem] pt-1">Materials</dt><dd class="text-sm text-muted leading-relaxed">${product.materials}</dd></div>
                <div class="grid grid-cols-[130px,1fr] gap-4 pb-5 border-b border-[var(--line)]"><dt class="eyebrow !text-[0.66rem] pt-1">Made for</dt><dd class="text-sm text-muted leading-relaxed">${product.madeFor}</dd></div>
                <div class="grid grid-cols-[130px,1fr] gap-4 pb-5 border-b border-[var(--line)]"><dt class="eyebrow !text-[0.66rem] pt-1">Craft time</dt><dd class="text-sm text-muted leading-relaxed">${product.craftTime}</dd></div>
                <div class="grid grid-cols-[130px,1fr] gap-4 pb-5 border-b border-[var(--line)]"><dt class="eyebrow !text-[0.66rem] pt-1">Care</dt><dd class="text-sm text-muted leading-relaxed">${product.care}</dd></div>
              </dl>
              <div class="flex flex-wrap gap-4">
                <a href="contact.html" class="btn btn-solid" data-magnetic>Inquire about this piece</a>
                <a href="https://www.instagram.com/sunshine_handicraft_n/" target="_blank" rel="noopener noreferrer" class="btn" data-magnetic>Message on Instagram</a>
              </div>
              <p class="text-xs text-muted mt-6 leading-relaxed">Each piece is handmade by Namita. Small variations are part of its character.</p>
            </div>
          </div>
        </div>
      </section>
      <section class="px-6 md:px-10 py-24 md:py-32">
        <div class="max-w-[1400px] mx-auto">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 reveal">
            <div><p class="eyebrow mb-5">You may also love</p><h2 class="serif text-4xl md:text-6xl leading-tight">More from the <span class="italic">collection.</span></h2></div>
            <a href="collections.html" class="arrow-link">View all pieces <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17 17 7M7 7h10v10"/></svg></a>
          </div>
          <div class="grid md:grid-cols-3 gap-8 md:gap-10">
            ${related.map(productCard).join('')}
          </div>
        </div>
      </section>
      <section class="px-6 md:px-10 py-20 md:py-28 bg-stonewarm/35 border-y border-[var(--line)]">
        <div class="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-10 items-center">
          <div class="md:col-span-5 reveal">
            <div class="img-frame aspect-[4/3] border border-[var(--line)]"><img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80" alt="Handcrafted jewelry in warm natural light" loading="lazy" width="1200" height="900"></div>
          </div>
          <div class="md:col-span-6 md:col-start-7 reveal reveal-delay-1">
            <p class="eyebrow mb-5">Handmade by Namita</p>
            <h2 class="serif text-4xl md:text-5xl leading-tight mb-6">No two pieces are ever exactly alike.</h2>
            <p class="text-muted leading-relaxed">Every Sunshine piece is shaped in small batches at Namita's home workspace. Slight variations in form and finish are part of what makes each piece personal.</p>
          </div>
        </div>
      </section>`;
  }

  function boot() {
    initProductDetail();
    if (window.Sunshine?.refresh) {
      window.Sunshine.refresh();
    } else {
      document.querySelectorAll('.reveal, .line-grow').forEach(el => el.classList.add('visible'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();