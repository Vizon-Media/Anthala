document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('devisModal');
    const openBtn = document.getElementById('openDevisModal');
    const closeBtn = modal ? modal.querySelector('.close-modal') : null;
    const devisForm = document.getElementById('devisForm');
    
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
    const fileInput = document.getElementById('devisFiles');
    const fileInfo = document.querySelector('#devisModal .file-info');
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
                alert('Dimensiunea totală a fișierelor depășește 10MB. Vă rugăm selectați mai puține fișiere sau reduceți dimensiunea acestora.');
                fileInput.value = '';
                fileInfo.textContent = '';
                selectedFiles = [];
                return;
            }
            
            selectedFiles = files;
            
            if (files.length > 0) {
                const fileNames = files.map(file => file.name).join(', ');
                const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
                fileInfo.textContent = `${files.length} fișiere selectate (${totalSizeMB} MB): ${fileNames}`;
            } else {
                fileInfo.textContent = '';
            }
        });
    }

    // Form submission
    if (devisForm) {
        devisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(devisForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Validate required fields
            const requiredFields = ['serviceType', 'projectType', 'name', 'email', 'phone', 'message'];
            const missingFields = requiredFields.filter(field => !formObject[field]);
            
            if (missingFields.length > 0) {
                alert('Vă rugăm completați toate câmpurile obligatorii (marcate cu *).');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formObject.email)) {
                alert('Vă rugăm introduceți o adresă de email validă.');
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
            emailBody += `Suprafață: ${formObject.projectSize || 'Nespecificat'} m²\n`;
            emailBody += `Detașament: ${formObject.timeline ? document.querySelector('#timeline option:checked').text : 'Nespecificat'}\n`;
            emailBody += `\n--- Mesaj ---\n${formObject.message}\n\n`;
            
            // Add file info if any
            if (selectedFiles.length > 0) {
                emailBody += `Fișiere atașate (${selectedFiles.length}):\n`;
                selectedFiles.forEach((file, index) => {
                    emailBody += `- ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\n`;
                });
                emailBody += '\nNotă: Fișierele nu pot fi atașate direct prin acest formular. Vă rugăm să le atașați manual în clientul dumneavoastră de email.';
            }

            // Open default email client
            const subject = `Quote Request - ${formObject.serviceType}`;
            const mailtoLink = `mailto:radu.tonu@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
            
            // Show success message and reset form
            alert('Thank you for your quote request! One of our specialists will contact you soon.');
            devisForm.reset();
            if (fileInfo) fileInfo.textContent = '';
            selectedFiles = [];
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Close modal after a short delay
            setTimeout(closeModal, 500);
        });
    }
});
