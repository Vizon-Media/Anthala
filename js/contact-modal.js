document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('contactModal');
    const openBtn = document.getElementById('openContactModal');
    const emailLink = document.getElementById('emailSocialLink');
    const closeBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

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

    // Open modal from contact button (kept for backward compatibility)
    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }

    // Open modal from email icon
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
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
    const fileInput = document.getElementById('attachment');
    const fileInfo = document.querySelector('.file-info');
    let selectedFile = null;

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if (file.size > maxSize) {
                    alert('Fișierul este prea mare. Mărimea maximă permisă este de 5MB.');
                    fileInput.value = '';
                    fileInfo.textContent = '';
                    return;
                }
                
                selectedFile = file;
                fileInfo.textContent = `Fișier selectat: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            } else {
                selectedFile = null;
                fileInfo.textContent = '';
            }
        });
    }

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Validate form
            if (!formObject.name || !formObject.email || !formObject.message) {
                alert('Vă rugăm completați toate câmpurile obligatorii.');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formObject.email)) {
                alert('Vă rugăm introduceți o adresă de email validă.');
                return;
            }

            // Prepare email body
            let body = `Nume: ${formObject.name}%0D%0A`;
            body += `Email: ${formObject.email}%0D%0A`;
            if (formObject.subject) {
                body += `Subiect: ${formObject.subject}%0D%0A`;
            }
            body += `%0D%0AMesaj:%0D%0A${formObject.message}`;

            // Add file info to the email body if a file is selected
            if (selectedFile) {
                body += `%0D%0A%0D%0AFișier atașat: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)%0D%0A`;
                body += `Notă: Fișierele nu pot fi atașate direct prin acest formular. `;
                body += `Vă rugăm să atașați manual fișierul în clientul dvs. de email.`;
            }

            // Send email using mailto (client-side only solution)
            const email = 'radu.tonu@yahoo.com';
            const subject = formObject.subject || 'Nou mesaj de pe site';
            
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
            
            // Show success message
            let successMessage = 'Vă mulțumim pentru mesaj! Un formular de e-mail s-a deschis. ';
            successMessage += 'Vă rugăm să trimiteți mesajul din clientul dvs. de e-mail.';
            
            if (selectedFile) {
                successMessage += '\n\nVă rugăm nu uitați să atașați fișierul în clientul de email.';
            }
            
            alert(successMessage);
            
            // Reset form and close modal
            contactForm.reset();
            fileInfo.textContent = '';
            selectedFile = null;
            closeModal();
        });
    }
});
