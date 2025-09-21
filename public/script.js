document.addEventListener('DOMContentLoaded', function() {
    const mediaUrlInput = document.getElementById('media-url');
    const downloadBtn = document.getElementById('download-btn');
    const downloadResult = document.getElementById('download-result');
    const resultContent = document.getElementById('result-content');
    const platformIcons = document.querySelectorAll('.platform-icon');

    // Add click event to platform icons
    platformIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            let exampleUrl = '';
            
            switch(platform) {
                case 'tiktok':
                    exampleUrl = 'https://vm.tiktok.com/ZSHn28CFTXhqf-KjyIO/';
                    break;
                case 'instagram':
                    exampleUrl = 'https://www.instagram.com/p/CrY9xNtODQl/';
                    break;
                case 'reddit':
                    exampleUrl = 'https://www.reddit.com/r/funny/comments/abc123/funny_video/';
                    break;
                case 'facebook':
                    exampleUrl = 'https://www.facebook.com/watch/?v=1234567890';
                    break;
                case 'snapchat':
                    exampleUrl = 'https://www.snapchat.com/add/username';
                    break;
                case 'soundcloud':
                    exampleUrl = 'https://soundcloud.com/user/song-title';
                    break;
            }
            
            mediaUrlInput.value = exampleUrl;
            mediaUrlInput.focus();
        });
    });

    // Download button click event
    downloadBtn.addEventListener('click', async function() {
        const mediaUrl = mediaUrlInput.value.trim();
        if (!mediaUrl) {
            alert('Please enter a URL');
            return;
        }
        
        try {
            // Show loading state
            resultContent.innerHTML = '<div class="loading">Loading...</div>';
            downloadResult.style.display = 'block';
            
            // Detect platform
            const platform = detectPlatform(mediaUrl);
            const platformBadge = platform !== 'unknown' ? 
                `<span class="platform-badge platform-${platform}">${platform}</span>` : '';
            
            // Call our API endpoint
            const response = await fetch(`/api/download?url=${encodeURIComponent(mediaUrl)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch data from the API');
            }
            
            const data = await response.json();
            
            // Display the results
            if (data && data.data) {
                let html = `${platformBadge}<h2>Download Options</h2>`;
                
                // Handle different response formats based on platform
                if (data.data.video) {
                    // Video content
                    html += `<div class="download-item">`;
                    html += `<h3>Video</h3>`;
                    
                    if (data.data.video.urls && data.data.video.urls.length > 0) {
                        data.data.video.urls.forEach((url, index) => {
                            html += `<a href="${url}" class="download-btn" target="_blank" download>Download Video ${index + 1}</a>`;
                        });
                    }
                    
                    html += `</div>`;
                }
                
                if (data.data.audio) {
                    // Audio content
                    html += `<div class="download-item">`;
                    html += `<h3>Audio</h3>`;
                    
                    if (data.data.audio.url) {
                        html += `<a href="${data.data.audio.url}" class="download-btn" target="_blank" download>Download Audio</a>`;
                    }
                    
                    html += `</div>`;
                }
                
                if (data.data.images && data.data.images.length > 0) {
                    // Images content
                    html += `<div class="download-item">`;
                    html += `<h3>Images</h3>`;
                    
                    data.data.images.forEach((url, index) => {
                        html += `<a href="${url}" class="download-btn" target="_blank" download>Download Image ${index + 1}</a>`;
                    });
                    
                    html += `</div>`;
                }
                
                resultContent.innerHTML = html;
            } else {
                resultContent.innerHTML = '<p>No downloadable content found for this URL.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            resultContent.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });
    
    // Function to detect platform from URL
    function detectPlatform(url) {
        if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('facebook.com')) return 'facebook';
        if (url.includes('reddit.com')) return 'reddit';
        if (url.includes('snapchat.com')) return 'snapchat';
        if (url.includes('soundcloud.com')) return 'soundcloud';
        return 'unknown';
    }
});