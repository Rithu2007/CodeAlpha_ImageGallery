// Notification System
class NotificationManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const notif = document.createElement('div');
        notif.className = `notification notif-${type}`;
        
        const text = document.createElement('span');
        text.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'notif-close';
        closeBtn.onclick = () => this.remove(notif);

        notif.appendChild(text);
        notif.appendChild(closeBtn);
        
        this.container.appendChild(notif);
        
        // Trigger animation
        requestAnimationFrame(() => {
            setTimeout(() => notif.classList.add('show'), 10);
        });
        
        if (duration > 0) {
            setTimeout(() => this.remove(notif), duration);
        }
    }

    remove(notif) {
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode === this.container) {
                this.container.removeChild(notif);
            }
        }, 300);
    }
}

window.notify = new NotificationManager();

// Interactive Logo
function initInteractiveLogo() {
    const logos = document.querySelectorAll('.sidebar-logo');
    logos.forEach(logo => {
        const text = logo.textContent.trim();
        if(text.toUpperCase() === 'GALLERYX') {
            logo.innerHTML = '';
            logo.style.position = 'relative';
            logo.style.display = 'inline-block';
            
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.transition = 'transform 0.5s ease-in-out';
                logo.appendChild(span);
            });
            
            setInterval(() => {
                const spans = Array.from(logo.querySelectorAll('span'));
                if(spans.length < 2) return;
                
                // Pick 2 random indices
                let idx1 = Math.floor(Math.random() * spans.length);
                let idx2 = Math.floor(Math.random() * spans.length);
                while(idx1 === idx2) idx2 = Math.floor(Math.random() * spans.length);
                
                const span1 = spans[idx1];
                const span2 = spans[idx2];
                
                const rect1 = span1.getBoundingClientRect();
                const rect2 = span2.getBoundingClientRect();
                
                const dx = rect2.left - rect1.left;
                const dy = rect2.top - rect1.top;
                
                // Animate to swap
                span1.style.transform = `translate(${dx}px, ${dy - 15}px)`;
                span2.style.transform = `translate(${-dx}px, ${-dy + 15}px)`;
                span1.style.zIndex = '10';
                span2.style.zIndex = '10';
                
                setTimeout(() => {
                    span1.style.transform = 'translate(0, 0)';
                    span2.style.transform = 'translate(0, 0)';
                    span1.style.zIndex = '1';
                    span2.style.zIndex = '1';
                }, 1500); // Return after 1.5s
                
            }, 3000);
        }
    });
}

document.addEventListener('DOMContentLoaded', initInteractiveLogo);
