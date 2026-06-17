document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const user = Storage.getCurrentUser();
    if (!user) return;

    let userImages = Storage.getImages().filter(img => img.userId === user.id);
    let currentFilteredImages = [...userImages];
    let currentLightboxIndex = 0;

    const container = document.getElementById('gallery-container');
    const uploadBtn = document.getElementById('trigger-upload');
    const fileInput = document.getElementById('file-upload');
    const dropZone = document.getElementById('drop-zone');
    const searchInput = document.getElementById('search-input');
    const filterType = document.getElementById('filter-type');
    const sortBy = document.getElementById('sort-by');

    // Lightbox elements
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbClose = document.querySelector('.lightbox-close');
    const lbPrev = document.querySelector('.lightbox-prev');
    const lbNext = document.querySelector('.lightbox-next');
    const lbDate = document.getElementById('lightbox-date');
    const lbDownload = document.getElementById('lightbox-download');
    const lbDelete = document.getElementById('lightbox-delete');

    // Auto trigger upload if query param is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upload') === 'true') {
        fileInput.click();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    function getDateGroupKey(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options).toUpperCase();
    }

    function renderGallery(imagesToRender) {
        container.innerHTML = '';
        
        // Sorting
        const sortValue = sortBy.value;
        imagesToRender.sort((a, b) => {
            if (sortValue === 'newest') return b.timestamp - a.timestamp;
            if (sortValue === 'oldest') return a.timestamp - b.timestamp;
            if (sortValue === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

        // Grouping
        const groups = {};
        imagesToRender.forEach(img => {
            const key = getDateGroupKey(img.timestamp);
            if (!groups[key]) groups[key] = [];
            groups[key].push(img);
        });

        for (const [groupName, imgs] of Object.entries(groups)) {
            const section = document.createElement('div');
            section.className = 'gallery-section';
            section.style.marginBottom = '2rem';

            const header = document.createElement('h3');
            header.textContent = groupName;
            header.style.marginBottom = '1rem';
            header.style.color = 'var(--text-muted)';
            section.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'masonry-grid';

            imgs.forEach(img => {
                const globalIndex = imagesToRender.findIndex(i => i.id === img.id);
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `
                    <img src="${img.data}" alt="${img.name}" loading="lazy">
                    <div class="gallery-item-overlay">
                        <div class="gallery-item-info">
                            <p>${new Date(img.timestamp).toLocaleTimeString()}</p>
                            <div style="display:flex; gap:5px; margin-top:5px;">
                                <button class="btn-small view-btn">View</button>
                                <a href="${img.data}" download="${img.name}" class="btn-small">Download</a>
                                <button class="btn-small btn-danger delete-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Overlay View Button
                item.querySelector('.view-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(globalIndex, imagesToRender);
                });
                
                // Overlay Delete Button
                item.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                });

                // Clicking the image itself
                item.addEventListener('click', (e) => {
                    if(!e.target.closest('button') && !e.target.closest('a')) {
                        openLightbox(globalIndex, imagesToRender);
                    }
                });
                grid.appendChild(item);
            });
            section.appendChild(grid);
            container.appendChild(section);
        }
    }

    function deleteImage(id) {
        if(confirm('Are you sure you want to delete this image?')) {
            const allImages = Storage.getImages().filter(i => i.id !== id);
            Storage.saveImages(allImages);
            userImages = allImages.filter(img => img.userId === user.id);
            window.notify.show('Image deleted successfully.', 'success');
            applyFilters();
        }
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            // Size restriction: 15MB
            if (file.size > 15 * 1024 * 1024) {
                window.notify.show(`Image ${file.name} exceeds 15 MB limit.`, 'error', 5000);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const newImg = {
                    id: Date.now() + Math.random().toString(),
                    userId: user.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    timestamp: Date.now()
                };
                const allImages = Storage.getImages();
                allImages.push(newImg);
                try {
                    Storage.saveImages(allImages);
                    userImages = allImages.filter(img => img.userId === user.id);
                    window.notify.show('Image uploaded successfully.', 'success');
                    applyFilters();
                } catch(err) {
                    window.notify.show('Storage limit reached! Please delete some images.', 'warning');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Upload Listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    dropZone.addEventListener('click', () => fileInput.click());

    // Filtering
    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const type = filterType.value;
        
        currentFilteredImages = userImages.filter(img => {
            const matchesQuery = img.name.toLowerCase().includes(query);
            const matchesType = type === 'all' || img.type === type;
            return matchesQuery && matchesType;
        });
        renderGallery(currentFilteredImages);
    }

    searchInput.addEventListener('input', applyFilters);
    filterType.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    // Lightbox functionality
    function openLightbox(index, sourceImages) {
        currentLightboxIndex = index;
        const img = sourceImages[index];
        lbImg.src = img.data;
        lbDate.textContent = `${img.name} - ${new Date(img.timestamp).toLocaleString()}`;
        lbDownload.href = img.data;
        lbDownload.download = img.name;
        lightbox.classList.remove('hidden');
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
        lbImg.src = '';
    }

    function nextImage() {
        if (currentLightboxIndex < currentFilteredImages.length - 1) {
            openLightbox(currentLightboxIndex + 1, currentFilteredImages);
        }
    }

    function prevImage() {
        if (currentLightboxIndex > 0) {
            openLightbox(currentLightboxIndex - 1, currentFilteredImages);
        }
    }

    lbClose.addEventListener('click', closeLightbox);
    lbNext.addEventListener('click', nextImage);
    lbPrev.addEventListener('click', prevImage);
    
    lbDelete.addEventListener('click', () => {
        const imgToDelete = currentFilteredImages[currentLightboxIndex];
        closeLightbox();
        deleteImage(imgToDelete.id);
    });

    // Logout handled globally in storage.js

    // SLIDESHOW FUNCTIONALITY
    const startSlideshowBtn = document.getElementById('start-slideshow-btn');
    const slideshowSetupModal = document.getElementById('slideshow-setup-modal');
    const slideshowDateSelect = document.getElementById('slideshow-date-select');
    const slideshowCancel = document.getElementById('slideshow-cancel');
    const slideshowPlay = document.getElementById('slideshow-play');
    
    const player = document.getElementById('slideshow-player');
    const playerImg = document.getElementById('slideshow-player-img');
    const playerStatus = document.getElementById('slideshow-status');
    const playerDate = document.getElementById('slideshow-player-date');
    const playerPause = document.getElementById('slideshow-pause');
    const playerExit = document.getElementById('slideshow-exit');
    const playerPrev = document.getElementById('slideshow-player-prev');
    const playerNext = document.getElementById('slideshow-player-next');
    const endScreen = document.getElementById('slideshow-end-screen');
    const btnReplay = document.getElementById('slideshow-replay');
    const btnExitEnd = document.getElementById('slideshow-exit-end');

    let slideshowImages = [];
    let slideshowIndex = 0;
    let slideshowTimer = null;
    let isPaused = false;

    startSlideshowBtn.addEventListener('click', () => {
        // Find unique dates
        const dates = [...new Set(userImages.map(img => new Date(img.timestamp).toDateString()))];
        if (dates.length === 0) {
            window.notify.show('No images to show.', 'warning');
            return;
        }
        
        slideshowDateSelect.innerHTML = dates.map(d => `<option value="${d}">${d}</option>`).join('');
        slideshowSetupModal.classList.remove('hidden');
    });

    slideshowCancel.addEventListener('click', () => slideshowSetupModal.classList.add('hidden'));

    slideshowPlay.addEventListener('click', () => {
        const selectedDate = slideshowDateSelect.value;
        slideshowImages = userImages.filter(img => new Date(img.timestamp).toDateString() === selectedDate);
        
        if (slideshowImages.length === 0) return;
        
        slideshowSetupModal.classList.add('hidden');
        window.notify.show('Slideshow started', 'info');
        
        // Enter fullscreen if possible
        if(document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('Fullscreen rejected'));
        }

        slideshowIndex = 0;
        isPaused = false;
        playerPause.textContent = 'Pause';
        endScreen.classList.add('hidden');
        player.classList.remove('hidden');
        player.style.display = 'flex';
        
        showSlide();
        startTimer();
    });

    function showSlide() {
        if(slideshowIndex >= slideshowImages.length) {
            stopTimer();
            endScreen.classList.remove('hidden');
            return;
        }
        playerImg.style.opacity = 0;
        const currentIndex = slideshowIndex;
        setTimeout(() => {
            const img = slideshowImages[currentIndex];
            if (!img) return;
            playerImg.src = img.data;
            playerStatus.textContent = `Image ${currentIndex + 1} of ${slideshowImages.length}`;
            playerDate.textContent = new Date(img.timestamp).toDateString();
            playerImg.style.opacity = 1;
        }, 200);
    }

    function startTimer() {
        stopTimer();
        if(!isPaused) {
            slideshowTimer = setInterval(() => {
                slideshowIndex++;
                showSlide();
            }, 3000);
        }
    }

    function stopTimer() {
        if(slideshowTimer) clearInterval(slideshowTimer);
    }

    playerPause.addEventListener('click', () => {
        isPaused = !isPaused;
        playerPause.textContent = isPaused ? 'Resume' : 'Pause';
        if(isPaused) stopTimer();
        else startTimer();
    });

    function exitSlideshow() {
        stopTimer();
        player.classList.add('hidden');
        player.style.display = 'none';
        if(document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log('Exit fullscreen rejected'));
        }
        window.notify.show('Slideshow ended', 'info');
    }

    playerExit.addEventListener('click', exitSlideshow);
    btnExitEnd.addEventListener('click', exitSlideshow);

    btnReplay.addEventListener('click', () => {
        slideshowIndex = 0;
        isPaused = false;
        playerPause.textContent = 'Pause';
        endScreen.classList.add('hidden');
        showSlide();
        startTimer();
    });

    playerNext.addEventListener('click', () => {
        slideshowIndex++;
        showSlide();
        startTimer();
    });

    playerPrev.addEventListener('click', () => {
        if(slideshowIndex > 0) {
            slideshowIndex--;
            showSlide();
            startTimer();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(!player.classList.contains('hidden')) {
            if(e.key === 'ArrowRight') playerNext.click();
            if(e.key === 'ArrowLeft') playerPrev.click();
            if(e.key === 'Escape') exitSlideshow();
            if(e.key === ' ') playerPause.click();
        }
    });

    // Initial render
    applyFilters();
});
