$(function () {

    // Header Scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 60) {
            $("header").addClass("fixed-header");
        } else {
            $("header").removeClass("fixed-header");
        }
    });

    // Featured Projects Owl Carousel
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

    // Trust Logos Carousel
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

    // Count
    $('.count').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });

    // AOS
    AOS.init({
        once: true,
    });

    // ============================================================
    // ====== FILE UPLOAD – CUSTOM ARRAY (add one by one or drag) ======
    // ============================================================
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const fileListDiv = document.getElementById('file-list');
    const briefNamesHidden = document.getElementById('briefNames');

    // Store files in an array
    let selectedFiles = [];

    // Allowed types and limits
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'application/msword'];
    const maxFiles = 3;
    const maxSize = 2.86 * 1024 * 1024; // 2.86 MB

    // Update the UI list and the hidden input
    function updateFileList() {
        fileListDiv.innerHTML = '';
        if (selectedFiles.length === 0) {
            briefNamesHidden.value = '';
            return;
        }

        let html = '<ul class="list-unstyled mb-0" style="font-size:0.9rem;">';
        selectedFiles.forEach((item, index) => {
            const size = (item.file.size / 1024).toFixed(1);
            html += `<li class="d-flex justify-content-between align-items-center py-1">
                      📎 ${item.file.name} (${size} KB)
                      <button type="button" class=" "${index}">✕</button>
                     </li>`;
        });
        html += '</ul>';
        fileListDiv.innerHTML = html;

        // Store file names in hidden input (optional)
        briefNamesHidden.value = selectedFiles.map(f => f.file.name).join(', ');

        // Attach remove listeners to each ✕ button
        fileListDiv.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const idx = parseInt(this.dataset.index, 10);
                selectedFiles.splice(idx, 1);
                updateFileList();
                // Reset the file input so the same file can be re-added if needed
                fileInput.value = '';
            });
        });
    }

    // Add files to the array (with validation)
    function addFiles(files) {
        const fileArray = Array.from(files);
        // Check total count
        if (selectedFiles.length + fileArray.length > maxFiles) {
            alert(`You can attach a maximum of ${maxFiles} files.`);
            return;
        }
        // Validate each file
        for (let f of fileArray) {
            if (!allowedTypes.includes(f.type)) {
                alert(`"${f.name}" is not allowed. Allowed: PNG, JPG, JPEG, PDF, DOC.`);
                return;
            }
            if (f.size > maxSize) {
                alert(`"${f.name}" exceeds the 2.86 MB limit.`);
                return;
            }
            // Prevent duplicates (by name and size)
            if (selectedFiles.some(item => item.file.name === f.name && item.file.size === f.size)) {
                alert(`"${f.name}" is already added.`);
                return;
            }
            selectedFiles.push({ file: f, name: f.name, size: f.size });
        }
        updateFileList();
        // Clear the input so the same file can be selected again (though duplicates are prevented)
        fileInput.value = '';
    }

    // ---------- Click / change event ----------
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length) {
                addFiles(this.files);
            }
            this.value = ''; // reset so the user can pick the same file again (but duplicates are blocked)
        });
    }

    // ---------- Drag & drop ----------
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '#ffffff';
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = 'rgba(255,255,255,0.3)';
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = 'rgba(255,255,255,0.3)';
            const files = e.dataTransfer.files;
            if (files.length) {
                addFiles(files);
            }
        });
    }

    // ============================================================
    // ====== FORM SUBMIT – send all files with FormData ======
    // ============================================================
    const form = document.getElementById('projectForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
 const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
            // Create a FormData object from the form (includes all regular fields)
            const formData = new FormData(this);

            // Append each file with the same field name 'Brief[]'
            selectedFiles.forEach(item => {
                formData.append('Brief[]', item.file, item.file.name);
            });

            // (Optional) Add the list of file names as a separate field
            formData.append('BriefNames', selectedFiles.map(f => f.file.name).join(', '));

            // Get the redirect URL from the hidden _next field
            const nextUrl = this.querySelector('input[name="_next"]')?.value || '/thank-you';

            // Send the request
            fetch(this.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = nextUrl;
                } else {
                    alert('Something went wrong. Please try again.');
                }
            })
            .catch(err => {
                alert('Network error. Please check your connection.');
                console.error(err);
            });
        });
    }

});