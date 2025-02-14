const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    typeInscription: { type: String, enum: ['nouvelle', 'renouvellement', 'mutation'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ['M', 'F'], required: true },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    tutor: {
        name: String,
        phone: String,
        email: String
    },
    address: {
        city: String,
        postalCode: String,
        fullAddress: String
    },
    documents: {
        carteIdentite: { type: String, validate: { validator: validateFileType, message: 'Invalid file type for carteIdentite' } },
        justificatifDomicile: { type: String, validate: { validator: validateFileType, message: 'Invalid file type for justificatifDomicile' } },
        certificatMedical: { type: String, validate: { validator: validateFileType, message: 'Invalid file type for certificatMedical' } },
    },
    droitImage: { type: String, enum: ['oui', 'non'] },
    status: { type: String, enum: ['refusé', 'attente', 'accepté'], default: 'attente' }
}, { timestamps: true });

function validateFileType(value) {
    const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const mimeType = getMimeType(value);
    return validMimeTypes.includes(mimeType);
}

function getMimeType(base64String) {
    const matches = base64String.match(/^data:([a-zA-Z0-9/+]+);base64,/);
    return matches ? matches[1] : '';
}

module.exports = mongoose.model('Registration', RegistrationSchema);
