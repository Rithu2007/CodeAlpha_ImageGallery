document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const user = Storage.getCurrentUser();
    if (!user) return;

    const images = Storage.getImages().filter(img => img.userId === user.id);

    // Update UI
    const welcomeEl = document.getElementById('welcome-message');
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.name}`;

    const totalImagesEl = document.getElementById('total-images-count');
    if (totalImagesEl) totalImagesEl.textContent = images.length;

    // Calculate approx storage
    const totalBytes = images.reduce((acc, img) => acc + (img.size || (img.data.length * 0.75)), 0);
    const storageUsageEl = document.getElementById('storage-usage');
    if (storageUsageEl) {
        const mb = (totalBytes / (1024 * 1024)).toFixed(2);
        storageUsageEl.textContent = `${mb} MB`;
    }

    // Uploaded Today
    const today = new Date().toDateString();
    const todayUploads = images.filter(img => new Date(img.timestamp).toDateString() === today);
    const todayUploadsEl = document.getElementById('today-uploads-count');
    if (todayUploadsEl) todayUploadsEl.textContent = todayUploads.length;

    // Most Recent Upload
    const recentUploadTimeEl = document.getElementById('recent-upload-time');
    if (images.length > 0 && recentUploadTimeEl) {
        const mostRecent = images.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
        recentUploadTimeEl.textContent = new Date(mostRecent.timestamp).toLocaleString();
    }

    // Chart Generation
    const chartEl = document.getElementById('activity-chart');
    const chartLabelsEl = document.getElementById('activity-chart-labels');
    
    if (chartEl && chartLabelsEl) {
        const last7Days = [];
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toDateString());
        }

        const counts = last7Days.map(dateStr => {
            return images.filter(img => new Date(img.timestamp).toDateString() === dateStr).length;
        });

        const maxCount = Math.max(...counts, 1); // Avoid div by 0

        chartEl.innerHTML = '';
        chartLabelsEl.innerHTML = '';

        counts.forEach((count, i) => {
            // Bar
            const barContainer = document.createElement('div');
            barContainer.style.flex = '1';
            barContainer.style.display = 'flex';
            barContainer.style.flexDirection = 'column';
            barContainer.style.justifyContent = 'flex-end';
            barContainer.style.alignItems = 'center';
            barContainer.style.height = '100%';
            
            const bar = document.createElement('div');
            const heightPercent = (count / maxCount) * 100;
            bar.style.height = `${heightPercent}%`;
            bar.style.width = '60%';
            bar.style.background = 'linear-gradient(to top, var(--border), #a1a1aa)';
            bar.style.borderRadius = '4px 4px 0 0';
            bar.style.transition = 'height 0.5s ease-out';
            bar.title = `${count} uploads`;
            
            barContainer.appendChild(bar);
            chartEl.appendChild(barContainer);

            // Label
            const label = document.createElement('div');
            label.style.flex = '1';
            label.style.textAlign = 'center';
            // Show short day name
            const d = new Date(last7Days[i]);
            label.textContent = d.toLocaleDateString(undefined, {weekday: 'short'});
            chartLabelsEl.appendChild(label);
        });
    }

    // Logout handled globally in storage.js
});