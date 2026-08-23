$(function () {

    // ============================================================
    // HEADER SCROLL
    // ============================================================

    $(window).on('scroll', function () {
        if ($(window).scrollTop() >= 60) {
            $("header").addClass("fixed-header");
        } else {
            $("header").removeClass("fixed-header");
        }
    });


    // ============================================================
    // FEATURED PROJECTS OWL CAROUSEL
    // ============================================================

    $('.featured-projects-slider .owl-carousel').owlCarousel({
        center: true,
        loop: true,
        margin: 30,
        nav: false,
        dots: false,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,

        responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 3 },
            1200: { items: 4 }
        }
    });


    // ============================================================
    // TRUST LOGOS CAROUSEL
    // ============================================================

    $('.trusted-logos-carousel').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: false,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,

        responsive: {
            0: { items: 2 },
            576: { items: 3 },
            768: { items: 4 },
            992: { items: 5 }
        }
    });


    // ============================================================
    // COUNTERS
    // ============================================================

    $('.count').each(function () {
        $(this)
            .prop('Counter', 0)
            .animate(
                { Counter: $(this).text() },
                {
                    duration: 1000,
                    easing: 'swing',
                    step: function (now) {
                        $(this).text(Math.ceil(now));
                    }
                }
            );
    });


    // ============================================================
    // AOS
    // ============================================================

    AOS.init({ once: true });


    // ============================================================
    // FILE UPLOAD
    // ============================================================

    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const fileListDiv = document.getElementById('file-list');
    const briefNamesHidden = document.getElementById('briefNames');

    let selectedFiles = [];

    // -------- limits (match worker) --------
    const maxFiles = 3;
    const maxFileSize = 2.86 * 1024 * 1024; // 2.86 MB
    const maxTotalSize = 3.5 * 1024 * 1024;  // 3.5 MB

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx'];

    // -------- helpers --------
    function getFileExtension(filename) {
        const dotIndex = filename.lastIndexOf('.');
        if (dotIndex === -1) return '';
        return filename.substring(dotIndex).toLowerCase();
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // -------- update file list --------
    function updateFileList() {
        if (!fileListDiv) return;
        fileListDiv.innerHTML = '';

        if (selectedFiles.length === 0) {
            if (briefNamesHidden) briefNamesHidden.value = '';
            return;
        }

        let html = `<ul class="list-unstyled mb-0" style="font-size:0.9rem; margin-top:10px;">`;
        selectedFiles.forEach(function (item, index) {
            html += `
                <li class="d-flex justify-content-between align-items-center py-1" style="gap:10px;">
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        <span>📎</span>
                        ${escapeHtml(item.file.name)}
                        <small style="opacity:0.65; margin-left:5px;">(${formatFileSize(item.file.size)})</small>
                    </span>
                    <button type="button" class="remove-file-btn" data-index="${index}" aria-label="Remove file" title="Remove file" style="border:0; background:transparent; color:#fff; cursor:pointer; font-size:18px; line-height:1; padding:2px 7px;">×</button>
                </li>
            `;
        });
        html += `</ul>`;
        fileListDiv.innerHTML = html;

        if (briefNamesHidden) {
            briefNamesHidden.value = selectedFiles.map(function (item) { return item.file.name; }).join(', ');
        }

        // remove buttons
        fileListDiv.querySelectorAll('.remove-file-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                const index = parseInt(this.dataset.index, 10);
                if (Number.isInteger(index) && index >= 0 && index < selectedFiles.length) {
                    selectedFiles.splice(index, 1);
                    updateFileList();
                    if (fileInput) fileInput.value = '';
                }
            });
        });
    }

    // -------- add files with validation --------
    function addFiles(files) {
        const fileArray = Array.from(files || []);
        if (fileArray.length === 0) return;

        // max count
        if (selectedFiles.length + fileArray.length > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed.`);
            return;
        }

        // total size
        const newTotalSize = selectedFiles.reduce((sum, item) => sum + item.file.size, 0)
                            + fileArray.reduce((sum, file) => sum + file.size, 0);
        if (newTotalSize > maxTotalSize) {
            alert('The combined attachment size is too large. Please keep all attachments below 3.5 MB total.');
            return;
        }

        // validate each file
        for (const file of fileArray) {
            const extension = getFileExtension(file.name);

            // extension (primary validation)
            if (!allowedExtensions.includes(extension)) {
                alert(`File "${file.name}" has an unsupported file extension.`);
                return;
            }

            // individual size
            if (file.size > maxFileSize) {
                alert(`File "${file.name}" exceeds the 2.86 MB limit.\n\nFile size: ${formatFileSize(file.size)}`);
                return;
            }

            // empty
            if (file.size === 0) {
                alert(`File "${file.name}" is empty.`);
                return;
            }

            // duplicate
            const duplicate = selectedFiles.some(function (item) {
                return item.file.name === file.name &&
                       item.file.size === file.size &&
                       item.file.lastModified === file.lastModified;
            });
            if (duplicate) {
                alert(`"${file.name}" is already attached.`);
                return;
            }
        }

        // all good – add
        fileArray.forEach(function (file) {
            selectedFiles.push({ file: file, name: file.name, size: file.size, lastModified: file.lastModified });
        });

        updateFileList();
        if (fileInput) fileInput.value = '';
    }

    // -------- file input change --------
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                addFiles(this.files);
            }
            this.value = '';
        });
    }

    // -------- drop zone --------
    if (dropZone) {
        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '#ffffff';
            this.style.background = '#4a2e1bcc';
        });
        dropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = 'rgba(255,255,255,0.3)';
            this.style.background = '#4a2e1b8d';
        });
        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = 'rgba(255,255,255,0.3)';
            this.style.background = '#4a2e1b8d';
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                addFiles(files);
            }
        });
    }


    // ============================================================
    // LOADING OVERLAY
    // ============================================================

    function showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            // force reflow to ensure it takes effect
            void overlay.offsetHeight;
        } else {
            console.warn('loadingOverlay not found');
        }
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }


    // ============================================================
    // FORM SUBMISSION
    // ============================================================

    const form = document.getElementById('projectForm');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            if (btn && btn.disabled) return;

            // show overlay
            showLoadingOverlay();

            if (btn) {
                btn.disabled = true;
                btn.dataset.originalText = btn.innerHTML;
                btn.innerHTML = 'Sending…';
            }

            try {
                const formData = new FormData(this);

                // remove the default file field (if any)
                formData.delete('files[]');

                // append our selected files
                selectedFiles.forEach(function (item) {
                    formData.append('files[]', item.file, item.file.name);
                });

                // set BriefNames
                formData.set('BriefNames', selectedFiles.map(function (item) { return item.file.name; }).join(', '));

                console.log('Files being submitted:', selectedFiles.map(function (item) {
                    return { name: item.file.name, type: item.file.type, size: item.file.size };
                }));

                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData
                });

                // success?
                if (response.ok || response.redirected) {
                    const nextUrl = this.querySelector('input[name="_next"]')?.value || 'https://kabrownie.digital/thank-you';
                    window.location.href = nextUrl;
                    return;
                }

                // error – read message
                let errorMessage = 'Something went wrong. Please try again.';
                try {
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const errorData = await response.json();
                        if (errorData && errorData.error) {
                            errorMessage = errorData.error;
                        }
                    } else {
                        const text = await response.text();
                        if (text) errorMessage = text;
                    }
                } catch (readError) {
                    console.error('Could not read server error:', readError);
                }

                throw new Error(errorMessage);

            } catch (error) {
                console.error('Form submission error:', error);
                alert(error.message || 'Network error. Please check your connection and try again.');

                // hide overlay and re-enable button
                hideLoadingOverlay();
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = btn.dataset.originalText || 'SEND INQUIRY';
                }
            }
        });
    }

});