document.addEventListener('DOMContentLoaded', () => {
    initFloatingCards();
    initTypewriter();
});

function initFloatingCards() {
    const container = document.getElementById('floating-cards-container');
    container.innerHTML = '';
    
    const imageUrls = [
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1470071131384-001b85755536?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=400"
    ];

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float-movement {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(var(--mx1), var(--my1)) rotate(var(--mr1)); }
            66% { transform: translate(var(--mx2), var(--my2)) rotate(var(--mr2)); }
            100% { transform: translate(var(--mx3), var(--my3)) rotate(var(--mr3)); }
        }
        .float-card-container {
            position: absolute;
            z-index: 1;
            opacity: 0.6;
            transition: opacity 0.4s ease, z-index 0.4s ease;
        }
        .float-card-container:hover {
            z-index: 100;
            opacity: 1;
            animation-play-state: paused;
        }
        .float-card {
            width: 100%;
            height: 100%;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            background: rgba(255, 255, 255, 0.03);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .float-card-container:hover .float-card {
            transform: scale(1.12);
            box-shadow: 0 15px 45px rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.4);
        }
        .float-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.6s ease;
        }
        .float-card-container:hover img {
            transform: scale(1.05);
        }
        
        /* Cursor animation */
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .cursor {
            display: inline-block;
            width: 8px;
            height: 1.2em;
            background-color: var(--primary);
            vertical-align: middle;
            margin-left: 2px;
            animation: blink 1s step-end infinite;
        }
    `;
    document.head.appendChild(style);

    // Defined zones around the edges to clear the center-content and maintain basic distance
    const zones = [
        { x: 5, y: 5 },   { x: 5, y: 38 },  { x: 5, y: 72 },   // Left side
        { x: 80, y: 5 },  { x: 80, y: 38 }, { x: 80, y: 72 },  // Right side
        { x: 30, y: 5 },  { x: 55, y: 5 },                     // Top center-ish
        { x: 30, y: 78 }, { x: 55, y: 78 },                    // Bottom center-ish
        { x: 18, y: 20 }, { x: 68, y: 20 }                     // In-between high
    ];

    const numCards = 12;
    for (let i = 0; i < numCards; i++) {
        const container_el = document.createElement('div');
        container_el.className = 'float-card-container';
        
        const card = document.createElement('div');
        card.className = 'float-card';

        // Keep image card sizes elegant and spaced
        const type = Math.random();
        let baseSize = 130 + Math.random() * 60; // Clean size, not too large
        let w, h;
        if (type < 0.33) { // Square
            w = baseSize; h = baseSize;
        } else if (type < 0.66) { // Landscape
            w = baseSize * 1.4; h = baseSize;
        } else { // Portrait
            w = baseSize; h = baseSize * 1.4;
        }
        
        container_el.style.width = `${w}px`;
        container_el.style.height = `${h}px`;

        // Position using the defined zones plus a small organic random offset
        const zone = zones[i % zones.length];
        const leftOffset = (Math.random() - 0.5) * 6; // max +-3vw drift
        const topOffset = (Math.random() - 0.5) * 6;  // max +-3vh drift
        container_el.style.left = `${zone.x + leftOffset}vw`;
        container_el.style.top = `${zone.y + topOffset}vh`;

        // Gently float with small drift ranges to maintain basic distances
        const range = 25; // Gentle float range (25px max)
        container_el.style.setProperty('--mx1', `${(Math.random() - 0.5) * range}px`);
        container_el.style.setProperty('--my1', `${(Math.random() - 0.5) * range}px`);
        container_el.style.setProperty('--mr1', `${(Math.random() - 0.5) * 8}deg`);
        
        container_el.style.setProperty('--mx2', `${(Math.random() - 0.5) * range}px`);
        container_el.style.setProperty('--my2', `${(Math.random() - 0.5) * range}px`);
        container_el.style.setProperty('--mr2', `${(Math.random() - 0.5) * 8}deg`);
        
        container_el.style.setProperty('--mx3', `${(Math.random() - 0.5) * range * 1.2}px`);
        container_el.style.setProperty('--my3', `${(Math.random() - 0.5) * range * 1.2}px`);
        container_el.style.setProperty('--mr3', `${(Math.random() - 0.5) * 8}deg`);

        const duration = 12 + Math.random() * 10;
        const delay = -Math.random() * duration;
        
        container_el.style.animation = `float-movement ${duration}s ease-in-out infinite alternate`;
        container_el.style.animationDelay = `${delay}s`;
        
        const img = document.createElement('img');
        img.src = imageUrls[i % imageUrls.length];
        card.appendChild(img);
        container_el.appendChild(card);
        
        container.appendChild(container_el);
    }
}

function initTypewriter() {
    const messages = [
        "Welcome to GalleryX!",
        "Organize your memories beautifully.",
        "Upload, Explore, Relive.",
        "Your personal photo universe.",
        "Start your journey today."
    ];
    
    // Setup logo for letter exchange
    const titleElement = document.querySelector('.logo-title');
    const titleText = titleElement.textContent.trim();
    titleElement.innerHTML = '';
    const spans = [];
    for (let char of titleText) {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        titleElement.appendChild(span);
        spans.push(span);
    }
    
    // Setup tagline for typewriter
    const taglineElement = document.querySelector('.tagline');
    taglineElement.innerHTML = '<span id="tw-text"></span><span class="cursor"></span>';
    const textElement = document.getElementById('tw-text');
    
    let msgIndex = 0;

    function scrambleLogo(callback) {
        // Measure initial x positions
        const rects = spans.map(s => s.getBoundingClientRect().left);
        
        // Shuffle indices
        let indices = Array.from({length: spans.length}, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Apply transform
        spans.forEach((span, i) => {
            const targetX = rects[indices[i]];
            const currentX = rects[i];
            span.style.transform = `translateX(${targetX - currentX}px) translateY(${Math.random() * 20 - 10}px) rotate(${Math.random() * 30 - 15}deg)`;
        });
        
        setTimeout(() => {
            // Restore
            spans.forEach(span => {
                span.style.transform = 'translate(0, 0) rotate(0deg)';
            });
            setTimeout(callback, 3000); // Wait 3 seconds after returning
        }, 1200); // 1.2s scramble hold time
    }

    async function typeWriterLoop() {
        while (true) {
            const msg = messages[msgIndex];
            
            // Type
            for (let i = 0; i <= msg.length; i++) {
                textElement.textContent = msg.substring(0, i);
                await new Promise(r => setTimeout(r, 60));
            }
            
            // Pause slightly
            await new Promise(r => setTimeout(r, 500));
            
            // Scramble logo and wait for callback
            await new Promise(r => scrambleLogo(r));
            
            // Delete
            for (let i = msg.length; i >= 0; i--) {
                textElement.textContent = msg.substring(0, i);
                await new Promise(r => setTimeout(r, 30));
            }
            
            // Pause before next
            await new Promise(r => setTimeout(r, 300));
            
            msgIndex = (msgIndex + 1) % messages.length;
        }
    }
    
    typeWriterLoop();
}