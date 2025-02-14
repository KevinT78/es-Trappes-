document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const getFileBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result); // Ne supprimez pas le préfixe ici
            reader.onerror = (error) => reject(error);
        });
    };

    const carteIdentiteFile = document.getElementById('carteIdentite').files[0];
    const justificatifDomicileFile = document.getElementById('justificatifDomicile').files[0];
    const certificatMedicalFile = document.getElementById('certificatMedical').files[0];

    try {
        const [carteIdentiteBase64, justificatifDomicileBase64, certificatMedicalBase64] = await Promise.all([
            getFileBase64(carteIdentiteFile),
            getFileBase64(justificatifDomicileFile),
            getFileBase64(certificatMedicalFile)
        ]);

        const formData = {
            typeInscription: document.getElementById('typeInscription').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            birthDate: document.getElementById('birthDate').value,
            gender: document.getElementById('gender').value,
            contact: {
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value
            },
            tutor: {
                name: document.getElementById('tutorName').value,
                phone: document.getElementById('tutorPhone').value,
                email: document.getElementById('tutorEmail').value
            },
            address: {
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value,
                fullAddress: document.getElementById('fullAddress').value
            },
            documents: {
                carteIdentite: carteIdentiteBase64,
                justificatifDomicile: justificatifDomicileBase64,
                certificatMedical: certificatMedicalBase64
            },
            droitImage: document.querySelector('input[name="droitImage"]:checked').value,
            status: 'attente'
        };

        const response = await fetch('http://localhost:3000/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error("Erreur lors de l'inscription");
        }

        alert("Inscription soumise avec succès ! Elle est en attente de validation.");
        document.getElementById('registrationForm').reset();
    } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
    }
});

// Afficher/masquer les champs du tuteur en fonction de l'âge
document.getElementById('birthDate').addEventListener('change', (e) => {
    const birthDate = new Date(e.target.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const tutorGroup = document.querySelector('.tutor-group');

    if (age < 18) {
        tutorGroup.style.display = 'block';
        document.getElementById('tutorName').required = true;
        document.getElementById('tutorPhone').required = true;
        document.getElementById('tutorEmail').required = true;
    } else {
        tutorGroup.style.display = 'none';
        document.getElementById('tutorName').required = false;
        document.getElementById('tutorPhone').required = false;
        document.getElementById('tutorEmail').required = false;
    }
});
