document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('quoteModal');
    const openBtn = document.getElementById('openQuoteModal');
    const closeBtn = modal ? modal.querySelector('.close-modal') : null;
    const quoteForm = document.getElementById('quoteForm');
    
    // Create overlay element if it doesn't exist
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    // Open modal function
    function openModal() {
        document.body.style.overflow = 'hidden';
        modal.style.display = 'block';
        overlay.classList.add('active');
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.add('open');
    }

    // Close modal function
    function closeModal() {
        modal.classList.remove('open');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300); // Match this with the CSS transition duration
    }

    // Open modal
    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close when clicking overlay
    overlay.addEventListener('click', closeModal);

    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // File input handling
    const fileInput = document.getElementById('quoteFiles');
    const fileInfo = document.querySelector('#quoteModal .file-info');
    let selectedFiles = [];
    const maxTotalSize = 10 * 1024 * 1024; // 10MB in bytes

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            let totalSize = 0;
            
            // Calculate total size of all files
            files.forEach(file => {
                totalSize += file.size;
            });
            
            if (totalSize > maxTotalSize) {
                alert('Total file size exceeds 10MB. Please select fewer files or reduce their size.');
                fileInput.value = '';
                fileInfo.textContent = '';
                selectedFiles = [];
                return;
            }
            
            selectedFiles = files;
            
            if (files.length > 0) {
                const fileNames = files.map(file => file.name).join(', ');
                const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
                fileInfo.textContent = `${files.length} files selected (${totalSizeMB} MB): ${fileNames}`;
            } else {
                fileInfo.textContent = '';
            }
        });
    }

    // Form submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(quoteForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Validate required fields
            const requiredFields = ['serviceType', 'projectType', 'name', 'email', 'phone', 'message'];
            const missingFields = requiredFields.filter(field => !formObject[field]);
            
            if (missingFields.length > 0) {
                alert('Please fill in all required fields (marked with *).');
                return;
            }

            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(formObject.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Prepare email content
            let emailBody = `Nume: ${formObject.name}\n`;
            emailBody += `Email: ${formObject.email}\n`;
            emailBody += `Telefon: ${formObject.phone || 'Nespecificat'}\n`;
            emailBody += `Adresă proiect: ${formObject.address || 'Nespecificat'}\n`;
            emailBody += `\n--- Detalii proiect ---\n`;
            emailBody += `Tip serviciu: ${document.querySelector('#serviceType option:checked').text}\n`;
            emailBody += `Tip proiect: ${document.querySelector('#projectType option:checked').text}\n`;
            
            // Add file info if any
            if (selectedFiles.length > 0) {
                emailBody += `Attached files (${selectedFiles.length}):\n`;
                selectedFiles.forEach((file, index) => {
                    emailBody += `- ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\n`;
                });
                emailBody += '\nNote: Files cannot be attached directly through this form. Please attach them manually in your email client.';
            }

            // Open default email client
            const subject = `Quote Request - ${formObject.serviceType}`;
            const mailtoLink = `mailto:radu.tonu@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
            
            // Show success message and reset form
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you for your request! Your message has been sent successfully.';
            document.body.appendChild(successMessage);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
            
            quoteForm.reset();
            if (fileInfo) fileInfo.textContent = '';
            selectedFiles = [];
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Close modal after a short delay
            setTimeout(closeModal, 500);
        });
    }
});
