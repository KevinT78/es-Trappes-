const Member = require('../models/Member');
const { sendPaymentConfirmation, sendPaymentReminder } = require('../utils/emailService'); // Assurez-vous que le chemin est correct

// Créer un nouveau membre
exports.createMember = async (req, res, next) => {
  try {
    const member = new Member(req.body); // Créer une nouvelle instance de Member avec les données du corps de la requête
    await member.save(); // Sauvegarder le membre dans la base de données
    res.status(201).json(member); // Répondre avec le membre créé
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};

// Obtenir tous les membres
exports.getAllMembers = async (req, res, next) => {
  try {
    const members = await Member.find(); // Récupérer tous les membres de la base de données
    res.json(members); // Répondre avec la liste des membres
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};

// Obtenir un membre par son ID
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id); // Récupérer le membre par son ID
    if (!member) {
      const error = new Error('Member not found');
      error.status = 404;
      throw error;
    }
    res.json(member); // Répondre avec le membre trouvé
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};

// Mettre à jour un membre
exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() }, // Mettre à jour les données du membre avec les nouvelles données du corps de la requête
      { new: true, runValidators: true } // Options pour renvoyer le membre mis à jour et exécuter les validateurs
    );
    if (!member) {
      const error = new Error('Member not found');
      error.status = 404;
      throw error;
    }
    res.json(member); // Répondre avec le membre mis à jour
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};

// Supprimer un membre
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id); // Supprimer le membre par son ID
    if (!member) {
      const error = new Error('Member not found');
      error.status = 404;
      throw error;
    }
    res.json({ message: 'Member deleted successfully' }); // Répondre avec un message de succès
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};

// Ajouter un paiement à un membre
exports.addPayment = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id); // Récupérer le membre par son ID
    if (!member) {
      const error = new Error('Member not found');
      error.status = 404;
      throw error;
    }

    const { amount, paymentMethod } = req.body; // Extraire le montant et la méthode de paiement du corps de la requête
    member.paymentHistory.push({ amount, paymentMethod }); // Ajouter le paiement à l'historique des paiements du membre
    member.totalPaid += amount; // Mettre à jour le total payé par le membre

    // Mettre à jour le statut de paiement du membre
    if (member.totalPaid >= member.totalDue) {
      member.paymentStatus = 'paid';
    } else if (member.totalPaid > 0) {
      member.paymentStatus = 'partial';
    }

    await member.save(); // Sauvegarder les modifications dans la base de données

    // Envoyer l'email de confirmation de paiement
    await sendPaymentConfirmation(member, { amount, paymentMethod });

    res.json(member); // Répondre avec le membre mis à jour
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};

// Envoyer des rappels de paiement
exports.sendPaymentReminders = async (req, res, next) => {
  try {
    const members = await Member.find({ paymentStatus: { $ne: 'paid' } }); // Récupérer les membres dont le statut de paiement n'est pas 'paid'
    const emailLogs = [];

    for (const member of members) {
      const success = await sendPaymentReminder(member); // Envoyer un rappel de paiement au membre
      if (success) {
        emailLogs.push(member.email); // Ajouter l'email du membre à la liste des emails envoyés
      }
    }

    console.log('Payment reminders sent to:', emailLogs); // Loguer les emails auxquels les rappels ont été envoyés
    res.json({ message: 'Payment reminders sent successfully', emails: emailLogs }); // Répondre avec un message de succès et la liste des emails
  } catch (error) {
    next(error); // Passer l'erreur au middleware de gestion des erreurs
  }
};




