(function () {
  const PRODUCTS = [
    {
      id: 'dawn-ring',
      title: 'The Dawn Ring',
      label: 'Everyday Minimal',
      category: 'everyday',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1400&q=80',
      alt: 'The Dawn Ring, minimal handcrafted ring',
      desc: 'A slim, gently polished ring designed for quiet everyday wear. Hand-shaped by Namita with a soft matte finish that catches light naturally.',
      details: 'Formed slowly at Namita\'s home workspace, the Dawn Ring is made to feel effortless on the hand. Its subtle profile makes it easy to wear alone or pair with other Sunshine pieces.',
      materials: 'Hand-shaped metal with a soft matte finish',
      madeFor: 'Everyday wear, gifting, stacking',
      craftTime: 'Small-batch, made by hand over several days',
      care: 'Keep dry when possible, store gently, and wipe with a soft cloth after wear.'
    },
    {
      id: 'petal-drop-earrings',
      title: 'Petal Drop Earrings',
      label: 'Nature Inspired',
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80',
      alt: 'Petal Drop Earrings, nature inspired handmade earrings',
      desc: 'Delicate drop earrings inspired by falling petals. Each curve is formed by hand, giving the pair an organic, effortless movement.',
      details: 'These earrings are shaped to move lightly with you. Namita forms each curve by hand, so every pair carries a natural rhythm and a slightly unique character.',
      materials: 'Hand-formed components with a warm polished finish',
      madeFor: 'Soft statements, nature-inspired styling, special everyday moments',
      craftTime: 'Handcrafted in small batches',
      care: 'Avoid moisture and perfumes; store flat or hanging to preserve shape.'
    },
    {
      id: 'sunlit-necklace',
      title: 'Sunlit Necklace',
      label: 'Statement Pieces',
      category: 'statement',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80',
      alt: 'Sunlit Necklace, handcrafted statement necklace',
      desc: 'A warm, expressive necklace that sits beautifully at the collarbone. Crafted to feel bold yet natural — a piece that carries its own light.',
      details: 'The Sunlit Necklace is designed to be noticed without feeling loud. Its handcrafted form rests close to the collarbone, bringing warmth and quiet confidence to simple outfits.',
      materials: 'Hand-finished pendant and chain with natural sheen',
      madeFor: 'Statement styling, meaningful gifts, occasions',
      craftTime: 'Individually handmade with careful finishing',
      care: 'Handle gently, keep away from harsh chemicals, and store separately.'
    },
    {
      id: 'whisper-studs',
      title: 'Whisper Studs',
      label: 'Everyday Minimal',
      category: 'everyday',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1400&q=80',
      alt: 'Whisper Studs, minimal handmade earrings',
      desc: 'Tiny, refined studs made for daily comfort. Their simple form makes them easy to wear alone or layered with other Sunshine pieces.',
      details: 'Whisper Studs are small, calm companions for everyday wear. Namita keeps the form minimal so the handmade finish and gentle glow can speak for themselves.',
      materials: 'Lightweight hand-finished studs',
      madeFor: 'Daily wear, minimal styling, second piercings',
      craftTime: 'Made in small home batches',
      care: 'Wipe after wear and store in a dry pouch.'
    },
    {
      id: 'leaf-wrap-cuff',
      title: 'Leaf Wrap Cuff',
      label: 'Nature Inspired',
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
      alt: 'Leaf Wrap Cuff, nature inspired handmade bracelet',
      desc: 'A gentle cuff with organic contours inspired by natural leaf forms. Hand-finished to preserve subtle texture and warmth.',
      details: 'The Leaf Wrap Cuff carries the impression of natural movement. Its open form and hand-worked texture make it comfortable, expressive, and easy to wear.',
      materials: 'Hand-shaped cuff with textured organic finish',
      madeFor: 'Layered looks, nature lovers, thoughtful gifting',
      craftTime: 'Shaped and refined by hand',
      care: 'Avoid bending forcefully; clean with a soft dry cloth.'
    },
    {
      id: 'halo-pendant',
      title: 'Halo Pendant',
      label: 'Statement Pieces',
      category: 'statement',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80',
      alt: 'Halo Pendant, handcrafted statement jewelry',
      desc: 'A sculptural pendant with a quiet presence. Designed to stand alone, it reflects Namita\'s love for simple forms with emotional weight.',
      details: 'Halo Pendant balances simplicity and presence. Its sculptural shape is finished by hand, giving it a calm strength that works beautifully on its own.',
      materials: 'Handcrafted pendant with smooth polished edges',
      madeFor: 'Standalone wear, meaningful occasions, modern heirloom feel',
      craftTime: 'Carefully handmade in limited batches',
      care: 'Store separately to avoid scratches and keep away from moisture.'
    }
  ];

  window.SUNSHINE_PRODUCTS = PRODUCTS;
  window.getSunshineProductById = function (id) {
    return PRODUCTS.find(p => p.id === id);
  };
})();