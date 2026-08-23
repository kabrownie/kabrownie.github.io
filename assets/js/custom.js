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

    var fileInput = document.getElementById('fileInput');
    var dropZone = document.getElementById('dropZone');
    var fileListDiv = document.getElementById('file-list');
    var briefNamesHidden = document.getElementById('briefNames');

    var selectedFiles = [];

    var maxFiles = 3;
    var maxFileSize = 2.86 * 1024 * 1024;
    var maxTotalSize = 3.5 * 1024 * 1024;
    var allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx'];

    function getFileExtension(filename) {
        var dotIndex = filename.lastIndexOf('.');
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

    function updateFileList() {
        if (!fileListDiv) return;
        fileListDiv.innerHTML = '';

        if (selectedFiles.length === 0) {
            if (briefNamesHidden) briefNamesHidden.value = '';
            return;
        }

        var html = '<ul class="list-unstyled mb-0" style="font-size:0.9rem; margin-top:10px;">';
        selectedFiles.forEach(function (item, index) {
            html += '<li class="d-flex justify-content-between align-items-center py-1" style="gap:10px;">' +
                '<span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' +
                '<span>📎</span> ' + escapeHtml(item.file.name) +
                ' <small style="opacity:0.65; margin-left:5px;">(' + formatFileSize(item.file.size) + ')</small>' +
                '</span>' +
                '<button type="button" class="remove-file-btn" data-index="' + index + '" aria-label="Remove file" title="Remove file" style="border:0; background:transparent; color:#fff; cursor:pointer; font-size:18px; line-height:1; padding:2px 7px;">×</button>' +
                '</li>';
        });
        html += '</ul>';
        fileListDiv.innerHTML = html;

        if (briefNamesHidden) {
            briefNamesHidden.value = selectedFiles.map(function (item) { return item.file.name; }).join(', ');
        }

        fileListDiv.querySelectorAll('.remove-file-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                var index = parseInt(this.dataset.index, 10);
                if (Number.isInteger(index) && index >= 0 && index < selectedFiles.length) {
                    selectedFiles.splice(index, 1);
                    updateFileList();
                    if (fileInput) fileInput.value = '';
                }
            });
        });
    }

    function addFiles(files) {
        var fileArray = Array.from(files || []);
        if (fileArray.length === 0) return;

        if (selectedFiles.length + fileArray.length > maxFiles) {
            alert('Maximum ' + maxFiles + ' files allowed.');
            return;
        }

        var newTotalSize = selectedFiles.reduce(function (sum, item) { return sum + item.file.size; }, 0) +
            fileArray.reduce(function (sum, file) { return sum + file.size; }, 0);

        if (newTotalSize > maxTotalSize) {
            alert('The combined attachment size is too large. Please keep all attachments below 3.5 MB total.');
            return;
        }

        for (var i = 0; i < fileArray.length; i++) {
            var file = fileArray[i];
            var extension = getFileExtension(file.name);

            if (!allowedExtensions.includes(extension)) {
                alert('File "' + file.name + '" has an unsupported file extension.');
                return;
            }
            if (file.size > maxFileSize) {
                alert('File "' + file.name + '" exceeds the 2.86 MB limit.\n\nFile size: ' + formatFileSize(file.size));
                return;
            }
            if (file.size === 0) {
                alert('File "' + file.name + '" is empty.');
                return;
            }

            var duplicate = selectedFiles.some(function (item) {
                return item.file.name === file.name &&
                    item.file.size === file.size &&
                    item.file.lastModified === file.lastModified;
            });
            if (duplicate) {
                alert('"' + file.name + '" is already attached.');
                return;
            }
        }

        fileArray.forEach(function (file) {
            selectedFiles.push({ file: file, name: file.name, size: file.size, lastModified: file.lastModified });
        });

        updateFileList();
        if (fileInput) fileInput.value = '';
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                addFiles(this.files);
            }
            this.value = '';
        });
    }

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
            var files = e.dataTransfer.files;
            if (files && files.length > 0) {
                addFiles(files);
            }
        });
    }


    // ============================================================
    // LOADING OVERLAY – SHOW / HIDE
    // ============================================================

    var overlay = document.getElementById('loadingOverlay');

    function showLoadingOverlay() {
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    function hideLoadingOverlay() {
        if (overlay) {
            overlay.style.display = 'none';
        }
    }


    // ============================================================
    // FORM SUBMISSION
    // ============================================================

    var form = document.getElementById('projectForm');
    var submitBtn = form ? form.querySelector('#submitBtn') : null;

    if (form && submitBtn) {

        // Show overlay instantly on button click (if form is valid)
        submitBtn.addEventListener('click', function (e) {
            if (form.checkValidity() && !form._submitting) {
                showLoadingOverlay();
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'SENDING…';
            }
        });

        // Handle form submission
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (form._submitting) return;
            form._submitting = true;

            // Make sure overlay is visible
            showLoadingOverlay();
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'SENDING…';

            var formData = new FormData(form);
            formData.delete('files[]');

            selectedFiles.forEach(function (item) {
                formData.append('files[]', item.file, item.file.name);
            });
            formData.set('BriefNames', selectedFiles.map(function (item) { return item.file.name; }).join(', '));

            fetch(form.action, {
                method: 'POST',
                body: formData
            })
                .then(function (response) {
                    if (response.ok || response.redirected) {
                        var nextUrl = form.querySelector('input[name="_next"]') ?
                            form.querySelector('input[name="_next"]').value :
                            'https://kabrownie.digital/thank-you';
                        window.location.href = nextUrl;
                    } else {
                        return response.text().then(function (text) {
                            throw new Error(text || 'Server error');
                        });
                    }
                })
                .catch(function (error) {
                    console.error('Submission error:', error);
                    alert(error.message || 'Network error. Please check your connection and try again.');
                    hideLoadingOverlay();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span class="btn-text">SEND INQUIRY</span><iconify-icon icon="lucide:arrow-up-right" class="btn-icon bg-white text-dark round-52 rounded-circle hstack justify-content-center fs-7 shadow-sm"></iconify-icon>';
                    form._submitting = false;
                });
        });
    }

});