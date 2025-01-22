// Fonction pour obtenir la catégorie et le genre à partir d'une sous-catégorie
const getCategoryAndGender = (subCategory) => {
  // Si la sous-catégorie n'est pas fournie, retourner les valeurs par défaut
  if (!subCategory) {
    return { gender: 'M', category: 'Seniors' };
  }

  // Nettoyer la sous-catégorie en supprimant les espaces en début et fin de chaîne
  const category = subCategory.trim();
  let gender = 'M'; // Genre par défaut

  // Déterminer le genre en fonction de la présence de 'F' ou 'Féminin' dans la sous-catégorie
  if (category.includes('F') || category.includes('Féminin')) {
    gender = 'F';
  }

  // Mapping des catégories avec leurs correspondances
  const categoryMapping = {
    'Seniors': 'Seniors',
    'Senior F': 'Seniors F',
    'Vétérans': 'Veterans',
    'U20': `U20${gender}`,
    'U19': `U19${gender}`,
    'U18': `U18${gender}`,
    'U17': `U17${gender}`,
    'U16': `U16${gender}`,
    'U15': `U15${gender}`,
    'U14': `U14${gender}`,
    'U13': `U13${gender}`,
    'U12': `U12${gender}`,
    'U11': `U11${gender}`,
    'U10': `U10${gender}`,
    'U9': `U9${gender}`,
    'U8': `U8${gender}`,
    'U7': `U7${gender}`,
    'U6': `U6${gender}`,
  };

  // Trouver la catégorie correspondante dans le mapping
  const matchedCategory = Object.keys(categoryMapping).find(key =>
    category.toUpperCase().includes(key.toUpperCase())
  );

  // Retourner le genre et la catégorie trouvée, ou 'Seniors' si aucune correspondance n'est trouvée
  return {
    gender,
    category: matchedCategory ? categoryMapping[matchedCategory] : 'Seniors'
  };
};

// Exporter la fonction pour qu'elle puisse être utilisée dans d'autres fichiers
module.exports = getCategoryAndGender;
