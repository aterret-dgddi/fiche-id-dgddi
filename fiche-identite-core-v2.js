/**
 * FICHE IDENTITÉ DGDDI - CORE FUNCTIONS
 * Fonctions partagées pour tous les gabarits
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION ET ÉTAT GLOBAL
// ═══════════════════════════════════════════════════════════════

const FICHE_STATE = {
  gristReady: false,
  structure: null,
  annee: null, // Sera définie automatiquement à partir des données
  data: {
    structures: null,
    rh: null,
    vehicules: null,
    frais_mission: null,
    informatique: null,
    communication: null,
    fonctionnement: null,
    budget: null,
    consolidation: null,
	consolidation_structure: null,
    commentaires: null,
    immobilier: null
  }
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Retourne le périmètre d'une structure (DI ou DR)
 */
function getPerimetreStructure(structureId) {
  const structures = FICHE_STATE.data.structures;
  if (!structures || !structures.id) return null;
  const index = structures.id.indexOf(structureId);
  if (index === -1) return null;
  return structures.Type?.[index] || null;
}

/**
 * Retourne les années disponibles dans les données
 */
function getAnneesDisponibles() {
  if (!FICHE_STATE.data.rh || !FICHE_STATE.data.rh.Annee) return [];
  const anneesSet = new Set();
  FICHE_STATE.data.rh.Annee.forEach(a => {
    if (a && a >= 2020) anneesSet.add(a);
  });
  return Array.from(anneesSet).sort((a, b) => a - b);
}


/**
 * Retourne les données consolidées pré-calculées pour une structure et une année
 * Utilise la table Consolidation_Structure qui contient tous les indicateurs
 * déjà calculés côté serveur (incluant DR rattachées pour les DI)
 */
function getConsolidationStructureData(structureId, annee) {
  const consolStruct = FICHE_STATE.data.consolidation_structure;
  
  if (!consolStruct || !consolStruct.Structure) {
    return null;
  }
  
  // Trouver la ligne correspondante
  for (let i = 0; i < consolStruct.Structure.length; i++) {
    if (consolStruct.Structure[i] === structureId && consolStruct.Annee[i] === annee) {
      return {
        // === RH ===
        effectif_total: consolStruct.Effectif_Total?.[i] || 0,
        effectif_agco: consolStruct.Effectif_AGCO?.[i] || 0,
        effectif_su: consolStruct.Effectif_SU?.[i] || 0,
        effectif_autres: consolStruct.Effectif_Autres?.[i] || 0,
        age_moyen: consolStruct.Age_Moyen?.[i] || 0,
        masse_salariale: consolStruct.Masse_Salariale?.[i] || 0,
        ms_par_agent: consolStruct.MS_Par_Agent?.[i] || 0,
        
        // === RH — pourcentages et âges depuis colonnes Grist ===
        pct_agco: consolStruct.Pct_AGCO?.[i] || 0,
        pct_su: consolStruct.Pct_SU?.[i] || 0,
        pct_autres: consolStruct.Pct_Autres?.[i] || 0,
        age_moyen_agco: consolStruct.Age_Moyen_AGCO?.[i] || 0,
        age_moyen_su: consolStruct.Age_Moyen?.[i] || 0,
        age_moyen_autres: consolStruct.Age_Moyen?.[i] || 0,

        // === VÉHICULES ===
        nb_vehicules: consolStruct.Nb_Vehicules?.[i] || 0,
        nb_vehicules_vetustes: consolStruct.Nb_Vehicules_Vetustes?.[i] || 0,
        taux_vetuste: consolStruct.Taux_Vetuste?.[i] || 0,
        ratio_vehicule_agent: consolStruct.Ratio_Vehicule_Agent?.[i] || 0,
        ratio_vehicule_su: consolStruct.Ratio_Vehicule_SU?.[i] || 0,
        budget_vehicules: consolStruct.Budget_Total_Vehicules?.[i] || 0,
        budget_fonctionnement_vehicules: consolStruct.Budget_Fonctionnement_Vehicules?.[i] || 0,
        budget_investissement_vehicules: consolStruct.Budget_Investissement_Vehicules?.[i] || 0,
        cout_fonctionnement_vehicule: consolStruct.Cout_Fonctionnement_Par_Vehicule?.[i] || 0,

        // === FRAIS DE MISSION ===
        frais_transport: consolStruct.Transport?.[i] || 0,
        frais_hebergement: consolStruct.Hebergement?.[i] || 0,
        frais_repas: consolStruct.Repas?.[i] || 0,
        frais_formation: consolStruct.Formation?.[i] || 0,
        frais_autres_missions: consolStruct.Autres_Missions?.[i] || 0,
        frais_mission_par_agent: consolStruct.Frais_Mission_Par_Agent?.[i] || 0,
        montant_total: consolStruct.Montant_Total?.[i] || 0,
        total_frais_mission: consolStruct.Montant_Total?.[i] || 0,
        pct_formation: consolStruct.Pct_Formation?.[i] || 0,
        pct_autres_missions: consolStruct.Pct_Autres_Missions?.[i] || 0,
        formation_par_agent: consolStruct.Formation_Par_Agent?.[i] || 0,
        autres_par_agent: consolStruct.Autres_Par_Agent?.[i] || 0,

        // === INFORMATIQUE ===
        postes_fixes: consolStruct.Postes_Fixes?.[i] || 0,
        portables: consolStruct.Portables?.[i] || 0,
        nb_postes_total: consolStruct.Nb_Postes_Total?.[i] || 0,
        taux_equipement: consolStruct.Taux_Equipement?.[i] || 0,
        pct_portables: consolStruct.Pct_Portables?.[i] || 0,
        budget_it_cp: consolStruct.Budget_IT_CP?.[i] || 0,
        budget_it_4ans: consolStruct.Budget_IT_4ans?.[i] || 0,
        budget_it_par_agent: consolStruct.IT_Par_Agent?.[i] || 0,
        budget_it_par_agent_4ans: consolStruct.IT_Par_Agent_Lisse?.[i] || 0,

        // === IMMOBILIER ===
        sub_total: consolStruct.SUB_Total?.[i] || 0,
        nb_sites: consolStruct.Nb_Sites?.[i] || 0,
        residents_total: consolStruct.Residents_Total?.[i] || 0,
        ratio_occupation: consolStruct.Ratio_Occupation?.[i] || null,
        charges_energie: consolStruct.Charges_Energie?.[i] || 0,
        cout_surfacique: consolStruct.Cout_Surfacique?.[i] || null
      };
    }
  }
  return null;
}

/**
 * Calcule la moyenne Budget_Fonctionnement et Budget_Investissement véhicules
 * sur le périmètre de la structure donnée, pour une année donnée,
 * en agrégeant Consolidation_Structure de toutes les structures sœurs.
 *
 * @param {number} structureId - ID de la structure de référence
 * @param {number} annee
 * @returns {{ moy_fonct: number, moy_invest: number }}
 */
function getMoyenneBudgetVehiculesPerimetre(structureId, annee) {
  const consolStruct = FICHE_STATE.data.consolidation_structure;
  const structures   = FICHE_STATE.data.structures;
  if (!consolStruct || !structures) return { moy_fonct: 0, moy_invest: 0 };

  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return { moy_fonct: 0, moy_invest: 0 };

  const typeRef     = structures.Type?.[idx] || '';
  const outreMerRef = structures.Est_Outremer?.[idx] || false;

  // Identifier les structures sœurs (même Type + même contexte outremer)
  const soeurIds = new Set();
  for (let i = 0; i < structures.id.length; i++) {
    const t  = structures.Type?.[i] || '';
    const om = structures.Est_Outremer?.[i] || false;
    if (t === typeRef && om === outreMerRef) {
      soeurIds.add(structures.id[i]);
    }
  }

  // Agréger depuis Consolidation_Structure
  let sumFonct = 0, sumInvest = 0, count = 0;
  for (let i = 0; i < consolStruct.Structure.length; i++) {
    if (consolStruct.Annee[i] === annee && soeurIds.has(consolStruct.Structure[i])) {
      const fonct  = consolStruct.Budget_Fonctionnement_Vehicules?.[i] || 0;
      const invest = consolStruct.Budget_Investissement_Vehicules?.[i] || 0;
      // Exclure les lignes à 0 budget (données manquantes, ex. 2022/2023)
      if (fonct > 0 || invest > 0) {
        sumFonct  += fonct;
        sumInvest += invest;
        count++;
      }
    }
  }

  return {
    moy_fonct:  count > 0 ? Math.round(sumFonct  / count) : 0,
    moy_invest: count > 0 ? Math.round(sumInvest / count) : 0
  };
}

/**
 * Convertit les structures du format colonaire Grist en tableau d'objets
 */
function getStructuresArray() {
  const structures = FICHE_STATE.data.structures;
  if (!structures || !structures.id) return [];
  
  const result = [];
  for (let i = 0; i < structures.id.length; i++) {
    result.push({
      id: structures.id[i],
      sigle: structures.Sigle?.[i] || '',
      nom: structures.Nom?.[i] || '',
      type: structures.Type?.[i] || '',
      estOutremer: structures.Est_Outremer?.[i] || false
    });
  }
  return result;
}

/**
 * Filtre les structures selon les types sélectionnés
 * Gère la distinction Métropole/Outremer pour DI et DR
 */
function filterStructuresByTypes(structures, selectedTypes) {
  if (!selectedTypes || selectedTypes.length === 0) {
    return structures;
  }
  
  return structures.filter(struct => {
    for (const filterType of selectedTypes) {
      if (filterType === 'DG' && struct.type === 'DG') return true;
      if (filterType === 'DI' && struct.type === 'DI' && !struct.estOutremer) return true;
      if (filterType === 'DI Outremer' && struct.type === 'DI' && struct.estOutremer) return true;
      if (filterType === 'DR Metropole' && struct.type === 'DR' && !struct.estOutremer) return true;
      if (filterType === 'DR Outremer' && struct.type === 'DR' && struct.estOutremer) return true;
      if (filterType === 'SCN' && struct.type === 'SCN') return true;
    }
    return false;
  });
}


// ═══════════════════════════════════════════════════════════════
// INITIALISATION GRIST
// ═══════════════════════════════════════════════════════════════

function initGrist() {
  if (typeof grist === 'undefined') {
    showError('Ce widget doit être ouvert dans Grist');
    return;
  }
  
  grist.ready({ requiredAccess: 'full' });
  
  // API DINUM - pas de onReady
  setTimeout(() => {
    FICHE_STATE.gristReady = true;
    loadAllData();
  }, 500);
}

// ═══════════════════════════════════════════════════════════════
// CHARGEMENT DES DONNÉES
// ═══════════════════════════════════════════════════════════════

async function loadAllData() {
  if (!FICHE_STATE.gristReady) return;
  
  try {
    showLoader('Chargement des données...');
    
    // Charger toutes les tables en parallèle
    const [structures, rh, vehicules, frais_mission, informatique, communication, fonctionnement, budget, consolidation, consolidation_structure, commentaires, immobilier] = await Promise.all([
      grist.docApi.fetchTable('Structures'),
      grist.docApi.fetchTable('RH'),
      grist.docApi.fetchTable('Vehicules'),
      grist.docApi.fetchTable('Frais_Mission'),
      grist.docApi.fetchTable('Informatique'),
      grist.docApi.fetchTable('Communication').catch(() => null),
      grist.docApi.fetchTable('Fonctionnement').catch(() => null),
      grist.docApi.fetchTable('Budget').catch(() => null),
      grist.docApi.fetchTable('Consolidation').catch(() => null),
      grist.docApi.fetchTable('Consolidation_Structure').catch(() => null),
      grist.docApi.fetchTable('Commentaires').catch(() => null),
      grist.docApi.fetchTable('Immobilier').catch(() => null)
    ]);
    
    FICHE_STATE.data.structures = structures;
    FICHE_STATE.data.rh = rh;
    FICHE_STATE.data.vehicules = vehicules;
    FICHE_STATE.data.frais_mission = frais_mission;
    FICHE_STATE.data.informatique = informatique;
    FICHE_STATE.data.communication = communication;
    FICHE_STATE.data.fonctionnement = fonctionnement;
    FICHE_STATE.data.budget = budget;
    FICHE_STATE.data.consolidation = consolidation;
    FICHE_STATE.data.consolidation_structure = consolidation_structure;
    FICHE_STATE.data.commentaires = commentaires;
    FICHE_STATE.data.immobilier = immobilier;
    
    hideLoader();
    onDataLoaded();
    
  } catch (err) {
    showError('Erreur de chargement : ' + err.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// SÉLECTION DE STRUCTURE
// ═══════════════════════════════════════════════════════════════

function getCurrentStructure() {
  // À implémenter selon le widget : 
  // - Pour DI/SCN : récupérer depuis le sélecteur de la page Grist
  // - Pour National : structure = null (consolidation)
  return grist.selectedTable ? grist.selectedTable.getRecord() : null;
}

// Détecter la dernière année disponible dans les données
function getDerniereAnnee() {
  const rh = FICHE_STATE.data.rh;
  if (!rh || !rh.Annee) return new Date().getFullYear();
  
  const annees = [...new Set(rh.Annee.filter(a => a > 0))];
  return Math.max(...annees);
}

function setStructure(structureId) {
  const structures = FICHE_STATE.data.structures;
  const idx = structures.id.indexOf(structureId);
  
  if (idx === -1) {
    showError('Structure non trouvée');
    return;
  }
  
  FICHE_STATE.structure = {
    id: structureId,
    hie: structures.HIE[idx],
    nom: structures.Nom[idx],
    sigle: structures.Sigle[idx],
    type: structures.Type[idx],
    region: structures.Region[idx],
    parent: structures.Parent ? structures.Parent[idx] : null
  };
  
  refreshFiche();
}

// Obtenir les DR rattachées à une DI
function getDRRattachees(structureId) {
  const structures = FICHE_STATE.data.structures;
  const drList = [];
  
  structures.id.forEach((id, idx) => {
    if (structures.Type[idx] === 'DR' && structures.Parent && structures.Parent[idx] === structureId) {
      drList.push(id);
    }
  });
  
  return drList;
}



// Calculer le rang d'une structure parmi ses pairs
function getRangStructure(structureId, annee, metrique = 'effectif_total') {
  const structures = FICHE_STATE.data.structures;
  const rh = FICHE_STATE.data.rh;
  
  // Déterminer le type de la structure
  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return null;
  
  const type = structures.Type[idx];
  
  // Filtrer les structures du même type
  const structuresDuMemeType = structures.id.filter((id, i) => structures.Type[i] === type);
  
  // Récupérer les valeurs pour chaque structure
  const valeurs = structuresDuMemeType.map(sid => {
    const data = getRHData(sid, annee);
    return {
      id: sid,
      valeur: data ? data[metrique] || 0 : 0
    };
  }).filter(v => v.valeur > 0); // Exclure structures sans données
  
  // Trier par valeur décroissante
  valeurs.sort((a, b) => b.valeur - a.valeur);
  
  // Trouver la position
  const position = valeurs.findIndex(v => v.id === structureId) + 1;
  
  return {
    rang: position,
    total: valeurs.length
  };
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION DES DONNÉES PAR STRUCTURE
// ═══════════════════════════════════════════════════════════════

function getRHData(structureId, annee) {
  const rh = FICHE_STATE.data.rh;
    // ✨ OPTIMISATION : Essayer d'abord Consolidation_Structure
  const consolData = getConsolidationStructureData(structureId, annee);
  
  if (consolData && consolData.effectif_total > 0) {
    return consolData;
  }
  
  // ⚠️ FALLBACK : Calcul manuel (ancien code)
  // Liste des structures à agréger
  let structureIds = [structureId];
  
  // Si c'est une DI, ajouter les DR rattachées
  const currentStruct = FICHE_STATE.data.structures;
  const idx = currentStruct.id.indexOf(structureId);
  if (idx !== -1 && currentStruct.Type[idx] === 'DI') {
    const drRattachees = getDRRattachees(structureId);
    structureIds = structureIds.concat(drRattachees);
  }
  
  // Agréger les données
  let totalAGCO = 0, totalSU = 0, totalAutres = 0, totalEffectif = 0, totalMS = 0;
  let sumAgeAGCO = 0, sumAgeSU = 0, sumAgeAutres = 0;
  let countAgeAGCO = 0, countAgeSU = 0, countAgeAutres = 0;
  
  structureIds.forEach(sid => {
    const idx = rh.id.findIndex((id, i) => 
      rh.Structure[i] === sid && 
      rh.Annee[i] === annee &&
      (rh.Mois[i] === 0 || rh.Mois[i] === null)
    );
    
    if (idx !== -1) {
      totalAGCO += rh.Effectif_AGCO[idx] || 0;
      totalSU += rh.Effectif_SU[idx] || 0;
      totalAutres += rh.Effectif_Autres[idx] || 0;
      totalEffectif += rh.Effectif_Remuner[idx] || 0;
      totalMS += rh.Masse_Salariale[idx] || 0;
      
      if (rh.Age_Moyen_AGCO && rh.Age_Moyen_AGCO[idx]) {
        sumAgeAGCO += rh.Age_Moyen_AGCO[idx] * (rh.Effectif_AGCO[idx] || 0);
        countAgeAGCO += rh.Effectif_AGCO[idx] || 0;
      }
      if (rh.Age_Moyen_SU && rh.Age_Moyen_SU[idx]) {
        sumAgeSU += rh.Age_Moyen_SU[idx] * (rh.Effectif_SU[idx] || 0);
        countAgeSU += rh.Effectif_SU[idx] || 0;
      }
      if (rh.Age_Moyen_Autres && rh.Age_Moyen_Autres[idx]) {
        sumAgeAutres += rh.Age_Moyen_Autres[idx] * (rh.Effectif_Autres[idx] || 0);
        countAgeAutres += rh.Effectif_Autres[idx] || 0;
      }
    }
  });
  
  if (totalEffectif === 0) return null;
  
  return {
    effectif_agco: totalAGCO,
    effectif_su: totalSU,
    effectif_autres: totalAutres,
    effectif_total: totalEffectif,
    masse_salariale: totalMS,
    age_moyen_agco: countAgeAGCO > 0 ? Math.round(sumAgeAGCO / countAgeAGCO * 10) / 10 : 0,
    age_moyen_su: countAgeSU > 0 ? Math.round(sumAgeSU / countAgeSU * 10) / 10 : 0,
    age_moyen_autres: countAgeAutres > 0 ? Math.round(sumAgeAutres / countAgeAutres * 10) / 10 : 0,
    pct_agco: totalEffectif > 0 ? Math.round(totalAGCO / totalEffectif * 1000) / 10 : 0,
    pct_su: totalEffectif > 0 ? Math.round(totalSU / totalEffectif * 1000) / 10 : 0,
    pct_autres: totalEffectif > 0 ? Math.round(totalAutres / totalEffectif * 1000) / 10 : 0
  };
}

function getRHHistorique(structureId) {
  const rh = FICHE_STATE.data.rh;
  
  // Liste des structures à agréger
  let structureIds = [structureId];
  
  // Si c'est une DI, ajouter les DR rattachées
  const currentStruct = FICHE_STATE.data.structures;
  const idx = currentStruct.id.indexOf(structureId);
  if (idx !== -1 && currentStruct.Type[idx] === 'DI') {
    const drRattachees = getDRRattachees(structureId);
    structureIds = structureIds.concat(drRattachees);
  }
  
  // Récupérer toutes les années disponibles
  const anneesSet = new Set();
  rh.id.forEach((id, i) => {
    if (structureIds.includes(rh.Structure[i]) && (rh.Mois[i] === 0 || rh.Mois[i] === null)) {
      anneesSet.add(rh.Annee[i]);
    }
  });
  
  const annees = Array.from(anneesSet).sort();
  
  // Agréger par année
  const historique = annees.map(annee => {
    let totalAGCO = 0, totalSU = 0, totalAutres = 0;
    
    structureIds.forEach(sid => {
      const idx = rh.id.findIndex((id, i) => 
        rh.Structure[i] === sid && 
        rh.Annee[i] === annee &&
        (rh.Mois[i] === 0 || rh.Mois[i] === null)
      );
      
      if (idx !== -1) {
        totalAGCO += rh.Effectif_AGCO[idx] || 0;
        totalSU += rh.Effectif_SU[idx] || 0;
        totalAutres += rh.Effectif_Autres[idx] || 0;
      }
    });
    
    return {
      annee: annee,
      agco: totalAGCO,
      su: totalSU,
      autres: totalAutres,
      total: totalAGCO + totalSU + totalAutres
    };
  });
  
  return historique;
}

function getRHDetailParDR(structureId, annee) {
  const rh = FICHE_STATE.data.rh;
  const structures = FICHE_STATE.data.structures;
  
  // Vérifier si c'est une DI
  const idx = structures.id.indexOf(structureId);
  if (idx === -1 || structures.Type[idx] !== 'DI') {
    return null;
  }
  
  // Récupérer la DI elle-même + les DR rattachées
  const drRattachees = getDRRattachees(structureId);
  const allStructures = [structureId].concat(drRattachees);
  
  const details = [];
  
  allStructures.forEach(sid => {
    const structIdx = structures.id.indexOf(sid);
    const rhIdx = rh.id.findIndex((id, i) => 
      rh.Structure[i] === sid && 
      rh.Annee[i] === annee &&
      (rh.Mois[i] === 0 || rh.Mois[i] === null)
    );
    
    if (rhIdx !== -1) {
      const effectifTotal = (rh.Effectif_AGCO[rhIdx] || 0) + (rh.Effectif_SU[rhIdx] || 0) + (rh.Effectif_Autres[rhIdx] || 0);
      const agcoCount = rh.Effectif_AGCO[rhIdx] || 0;
      const suCount = rh.Effectif_SU[rhIdx] || 0;
      const autresCount = rh.Effectif_Autres[rhIdx] || 0;
      const masseSalariale = rh.Masse_Salariale[rhIdx] || 0;
      
      details.push({
        nom: structures.Nom[structIdx],
        sigle: (structures.Sigle[structIdx] && structures.Sigle[structIdx].trim()) || structures.Nom[structIdx], // Utiliser Nom si Sigle vide
        type: structures.Type[structIdx],
        effectif_total: effectifTotal,
        effectif_agco: agcoCount,
        effectif_su: suCount,
        effectif_autres: autresCount,
        masse_salariale: masseSalariale,
        ms_par_agent: effectifTotal > 0 ? Math.round(masseSalariale / effectifTotal) : 0,
        age_moyen_total: effectifTotal > 0 ? 
          Math.round(
            ((rh.Age_Moyen_AGCO && rh.Age_Moyen_AGCO[rhIdx] ? rh.Age_Moyen_AGCO[rhIdx] * agcoCount : 0) +
             (rh.Age_Moyen_SU && rh.Age_Moyen_SU[rhIdx] ? rh.Age_Moyen_SU[rhIdx] * suCount : 0) +
             (rh.Age_Moyen_Autres && rh.Age_Moyen_Autres[rhIdx] ? rh.Age_Moyen_Autres[rhIdx] * autresCount : 0)) / effectifTotal * 10
          ) / 10 : 0,
        age_moyen_agco: (rh.Age_Moyen_AGCO && rh.Age_Moyen_AGCO[rhIdx]) || 0,
        age_moyen_su: (rh.Age_Moyen_SU && rh.Age_Moyen_SU[rhIdx]) || 0,
        age_moyen_autres: (rh.Age_Moyen_Autres && rh.Age_Moyen_Autres[rhIdx]) || 0
      });
    }
  });
  
  return details;
}

function getVehiculesData(structureId, annee) {
  const veh = FICHE_STATE.data.vehicules;

  // Priorite 1 : table Vehicules brute (donnees exactes de la structure)
  if (veh && veh.id) {
    const idx = veh.id.findIndex((id, i) =>
      veh.Structure[i] === structureId &&
      veh.Annee[i] === annee
    );
    if (idx !== -1) {
      const nombre_total = veh.Nombre_Total[idx] || 0;
      const budget_fonctionnement = veh.Budget_Fonctionnement_CP[idx] || 0;
      const budget_total = veh.Budget_Total_CP[idx] || 0;
      // Si ligne brute vide (0 véhicules ET 0 budget), passer en P2 Consolidation_Structure
      if (nombre_total === 0 && budget_fonctionnement === 0 && budget_total === 0) {
        // fall through vers P2
      } else {
        return {
          nombre_total,
          nombre_vetuste: veh.Nombre_Vetuste[idx] || 0,
          taux_vetuste: veh.Taux_Vetuste[idx] || 0,
          budget_fonctionnement,
          budget_investissement: veh.Budget_Investissement_CP[idx] || 0,
          budget_total,
          ratio_vehicule_agent: veh.Ratio_Vehicule_Agent_Total[idx] || 0,
          ratio_vehicule_su: veh.Ratio_Vehicule_Agent_SU[idx] || 0,
          cout_fonct_vehicule: nombre_total > 0 ? budget_fonctionnement / nombre_total : 0
        };
      }
    }
  }

  // Priorite 2 : Consolidation_Structure (DI sans ligne propre, ex: DI 972)
  // Condition élargie : déclencher si inventaire OU budget présent (DI 972 2022/2023 = budget sans véhicules)
  const consolData = getConsolidationStructureData(structureId, annee);
  const hasBudget = consolData && (
    consolData.nb_vehicules > 0 ||
    consolData.budget_vehicules > 0 ||
    consolData.budget_fonctionnement_vehicules > 0
  );
  if (hasBudget) {
    return {
      nombre_total:          consolData.nb_vehicules || 0,
      nombre_vetuste:        consolData.nb_vehicules_vetustes || 0,
      taux_vetuste:          consolData.taux_vetuste || 0,
      budget_fonctionnement: consolData.budget_fonctionnement_vehicules || 0,
      budget_investissement: consolData.budget_investissement_vehicules || 0,
      budget_total:          consolData.budget_vehicules || 0,
      ratio_vehicule_agent:  consolData.ratio_vehicule_agent || 0,
      ratio_vehicule_su:     consolData.ratio_vehicule_su || 0,
      cout_fonct_vehicule:   consolData.cout_fonctionnement_vehicule || 0
    };
  }

  return null;
}



/**
 * Retourne les données budgétaires depuis la table Budget pour une structure/année.
 * Retourne null si aucune ligne trouvée.
 */
function getBudgetData(structureId, annee) {
  const budget = FICHE_STATE.data.budget;
  if (!budget) return null;

  const idx = budget.id.findIndex((id, i) =>
    budget.Structure[i] === structureId && budget.Annee[i] === annee
  );

  // Fallback DI sans ligne propre : agréger les DR rattachées (ex. DI 972 → DR 971/972/973)
  if (idx === -1) {
    const structures = FICHE_STATE.data.structures;
    if (!structures) return null;
    const sIdx = structures.id.indexOf(structureId);
    if (sIdx === -1 || structures.Type[sIdx] !== 'DI') return null;

    const drIds = getDRRattachees(structureId);
    if (!drIds.length) return null;

    const sum = col => drIds.reduce((acc, drId) => {
      const i = budget.id.findIndex((_, j) =>
        budget.Structure[j] === drId && budget.Annee[j] === annee
      );
      return acc + (i !== -1 ? Number(budget[col]?.[i]) || 0 : 0);
    }, 0);

    const dot_ae = ['dot_AE_vehicules','dot_AE_fonctionnement','Dot_AE_T6','dot_AE_Immo'].map(sum);
    const dot_cp = ['dot_CP_vehicules','dot_CP_fonctionnement','Dot_CP_T6','dot_CP_Immo'].map(sum);
    const conso_ae = ['Conso_AE_vehicules','Conso_AE_fonctionnement','Conso_AE_T6','Conso_AE_Immo'].map(sum);
    const conso_cp = ['Conso_CP_vehicules','Conso_CP_fonctionnement','Conso_CP_T6','Conso_CP_Immo'].map(sum);

    const taux = (conso, dot) => dot > 0 ? conso / dot : 0;

    return {
      dot_ae_vehicules: dot_ae[0], dot_ae_fonctionnement: dot_ae[1], dot_ae_t6: dot_ae[2], dot_ae_immo: dot_ae[3],
      dot_cp_vehicules: dot_cp[0], dot_cp_fonctionnement: dot_cp[1], dot_cp_t6: dot_cp[2], dot_cp_immo: dot_cp[3],
      conso_ae_vehicules: conso_ae[0], conso_ae_fonctionnement: conso_ae[1], conso_ae_t6: conso_ae[2], conso_ae_immo: conso_ae[3],
      conso_cp_vehicules: conso_cp[0], conso_cp_fonctionnement: conso_cp[1], conso_cp_t6: conso_cp[2], conso_cp_immo: conso_cp[3],
      taux_ae_vehicules: taux(conso_ae[0], dot_ae[0]),
      taux_ae_fonctionnement: taux(conso_ae[1], dot_ae[1]),
      taux_ae_t6: taux(conso_ae[2], dot_ae[2]),
      taux_ae_immo: taux(conso_ae[3], dot_ae[3]),
      taux_cp_vehicules: taux(conso_cp[0], dot_cp[0]),
      taux_cp_fonctionnement: taux(conso_cp[1], dot_cp[1]),
      taux_cp_t6: taux(conso_cp[2], dot_cp[2]),
      taux_cp_immo: taux(conso_cp[3], dot_cp[3]),
      date_import: null,
      get dot_ae_total() { return dot_ae.reduce((a,b) => a+b, 0); },
      get dot_cp_total() { return dot_cp.reduce((a,b) => a+b, 0); },
      get conso_ae_total() { return conso_ae.reduce((a,b) => a+b, 0); },
      get conso_cp_total() { return conso_cp.reduce((a,b) => a+b, 0); },
      get taux_ae_total() { return this.dot_ae_total > 0 ? this.conso_ae_total / this.dot_ae_total : 0; },
      get taux_cp_total() { return this.dot_cp_total > 0 ? this.conso_cp_total / this.dot_cp_total : 0; },
    };
  }

  const n = col => Number(budget[col]?.[idx]) || 0;
  return {
    // Dotations AE
    dot_ae_vehicules:      n('dot_AE_vehicules'),
    dot_ae_fonctionnement: n('dot_AE_fonctionnement'),
    dot_ae_t6:             n('Dot_AE_T6'),
    dot_ae_immo:           n('dot_AE_Immo'),
    // Dotations CP
    dot_cp_vehicules:      n('dot_CP_vehicules'),
    dot_cp_fonctionnement: n('dot_CP_fonctionnement'),
    dot_cp_t6:             n('Dot_CP_T6'),
    dot_cp_immo:           n('dot_CP_Immo'),
    // Consommations AE
    conso_ae_vehicules:      n('Conso_AE_vehicules'),
    conso_ae_fonctionnement: n('Conso_AE_fonctionnement'),
    conso_ae_t6:             n('Conso_AE_T6'),
    conso_ae_immo:           n('Conso_AE_Immo'),
    // Consommations CP
    conso_cp_vehicules:      n('Conso_CP_vehicules'),
    conso_cp_fonctionnement: n('Conso_CP_fonctionnement'),
    conso_cp_t6:             n('Conso_CP_T6'),
    conso_cp_immo:           n('Conso_CP_Immo'),
    // Taux calculés AE
    taux_ae_vehicules:      n('Taux_AE_vehicules'),
    taux_ae_fonctionnement: n('Taux_AE_fonctionnement'),
    taux_ae_t6:             n('Taux_AE_T6'),
    taux_ae_immo:           n('Taux_AE_Immo'),
    // Taux calculés CP
    taux_cp_vehicules:      n('Taux_CP_vehicules'),
    taux_cp_fonctionnement: n('Taux_CP_fonctionnement'),
    taux_cp_t6:             n('Taux_CP_T6'),
    taux_cp_immo:           n('Taux_CP_Immo'),
    // Date import
    date_import: (() => {
      const raw = budget['Date_Import']?.[idx];
      if (!raw) return null;
      if (typeof raw === 'string' && raw.match(/^\d{4}-\d{2}-\d{2}$/)) return new Date(raw);
      if (typeof raw === 'number') return new Date(raw * 1000);
      return null;
    })(),
    // Totaux
    get dot_ae_total() { return this.dot_ae_vehicules + this.dot_ae_fonctionnement + this.dot_ae_t6 + this.dot_ae_immo; },
    get dot_cp_total() { return this.dot_cp_vehicules + this.dot_cp_fonctionnement + this.dot_cp_t6 + this.dot_cp_immo; },
    get conso_ae_total() { return this.conso_ae_vehicules + this.conso_ae_fonctionnement + this.conso_ae_t6 + this.conso_ae_immo; },
    get conso_cp_total() { return this.conso_cp_vehicules + this.conso_cp_fonctionnement + this.conso_cp_t6 + this.conso_cp_immo; },
    get taux_ae_total() { return this.dot_ae_total > 0 ? this.conso_ae_total / this.dot_ae_total : 0; },
    get taux_cp_total() { return this.dot_cp_total > 0 ? this.conso_cp_total / this.dot_cp_total : 0; },
  };
}

/**
 * Retourne les données Budget pour toutes les années disponibles pour une structure.
 * Utile pour la vue évolutive.
 */
function getBudgetHistorique(structureId) {
  const budget = FICHE_STATE.data.budget;
  if (!budget) return {};

  // Collecter les années via la structure ET ses DR rattachées (ex. DI 972)
  const idsToScan = [structureId];
  const structures = FICHE_STATE.data.structures;
  if (structures) {
    const sIdx = structures.id.indexOf(structureId);
    if (sIdx !== -1 && structures.Type[sIdx] === 'DI') {
      idsToScan.push(...getDRRattachees(structureId));
    }
  }

  const annees = new Set();
  budget.id.forEach((id, i) => {
    if (idsToScan.includes(budget.Structure[i]) && budget.Annee[i]) {
      annees.add(budget.Annee[i]);
    }
  });

  const result = {};
  annees.forEach(annee => {
    const d = getBudgetData(structureId, annee);
    if (d) result[annee] = d;
  });
  return result;
}

/**
 * Retourne les moyennes budgétaires périmètre depuis Consolidation.
 * Inclut taux par catégorie + taux global.
 */
function getBudgetMoyennes(perimetre, annee) {
  const conso = getConsolidationData(perimetre, annee);
  if (!conso) return null;
  return {
    taux_ae_vehicules:      Number(conso.moy_taux_ae_vehicules) || 0,
    taux_cp_vehicules:      Number(conso.moy_taux_cp_vehicules) || 0,
    taux_ae_fonctionnement: Number(conso.moy_taux_ae_fonctionnement) || 0,
    taux_cp_fonctionnement: Number(conso.moy_taux_cp_fonctionnement) || 0,
    taux_ae_t6:             Number(conso.moy_taux_ae_t6) || 0,
    taux_cp_t6:             Number(conso.moy_taux_cp_t6) || 0,
    taux_ae_immo:           Number(conso.moy_taux_ae_immo) || 0,
    taux_cp_immo:           Number(conso.moy_taux_cp_immo) || 0,
    taux_ae_total:          Number(conso.taux_conso_moyen_ae) / 100 || 0,
    taux_cp_total:          Number(conso.taux_conso_moyen_cp) / 100 || 0,
  };
}

/**
 * Retourne le périmètre de comparaison Budget pour une structure.
 */
function getPerimetreBudget(structureId) {
  const structures = FICHE_STATE.data.structures;
  if (!structures) return 'National';
  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return 'National';
  const type = structures.Type[idx];
  const estOutremer = structures.Est_Outremer?.[idx];
  if (type === 'SCN') return 'SCN';
  if (type === 'DR' && estOutremer) return 'Outremer';
  if (type === 'DI' && !estOutremer) return 'Metropole';
  if (type === 'DI' && estOutremer) return 'Outremer';
  return 'National';
}

/**
 * Ancienne fonction getTauxConsoComparaison — redirige vers getBudgetMoyennes.
 */
function getTauxConsoComparaison(perimetre, annee) {
  const moy = getBudgetMoyennes(perimetre, annee);
  if (!moy) return null;
  return {
    taux_ae: moy.taux_ae_total * 100,
    taux_cp: moy.taux_cp_total * 100,
  };
}

/**
 * Retourne les données de consolidation pour un périmètre et une année
 * Utilisé pour les comparaisons "vs périmètre" dans les sections
 */
function getConsolidationData(perimetre, annee) {
  const conso = FICHE_STATE.data.consolidation;
  
  if (!conso || !conso.Perimetre) {
    return null;
  }
  
  const idx = conso.id.findIndex((id, i) => 
    conso.Perimetre[i] === perimetre && 
    conso.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  const n = (col) => Number(conso[col]?.[idx]) || 0;
  return {
    // === RH ===
    nb_structures:                n('Nb_Structures'),
    total_effectif:               n('Total_Effectif'),
    total_effectif_agco:          n('Total_Effectif_AGCO'),
    total_effectif_su:            n('Total_Effectif_SU'),
    total_effectif_autres:        n('Total_Effectif_Autres'),
    total_masse_salariale:        n('Total_Masse_Salariale'),
    moyenne_ms_par_agent:         n('Moyenne_MS_Par_Agent'),
    pct_agco:                     n('Pct_AGCO'),
    pct_su:                       n('Pct_SU'),
    age_moyen_global:             n('Age_Moyen_Global'),
    effectif_moyen:               n('Effectif_Moyen_Par_Structure'),
    effectif_agco_moyen:          n('Effectif_AGCO_Moyen_Par_Structure'),
    effectif_su_moyen:            n('Effectif_SU_Moyen_Par_Structure'),

    // === VÉHICULES ===
    total_vehicules:              n('Total_Vehicules'),
    total_vehicules_vetustes:     n('Total_Vehicules_Vetustes'),
    taux_vetuste_moyen:           n('Taux_Vetuste_Moyen'),
    ratio_vehicule_agent:         n('Ratio_Vehicule_Agent'),
    total_budget_vehicules:       n('Total_Budget_Vehicules'),
    total_budget_fonct_vehicules: n('Total_Budget_Fonctionnement_Vehicules'),
    moy_nb_vehicules:             n('Moy_Nb_Vehicules'),
    moy_taux_vetuste:             n('Moy_Taux_Vetuste'),
    moy_budget_vehicules:         n('Moy_Budget_Vehicules'),
    moy_ratio_vehicule_agent:     n('Moy_Ratio_Vehicule_Agent'),
    moy_ratio_vehicule_su:        n('Moy_Ratio_Vehicule_SU'),
    moy_cout_fonct_vehicule:      n('Moy_Cout_Fonctionnement_Par_Vehicule'),

    // === BUDGET (notifs BOP) ===
    total_notif_ae:               n('Total_Notif_AE'),
    total_notif_cp:               n('Total_Notif_CP'),
    total_conso_ae:               n('Total_Conso_AE'),
    total_conso_cp:               n('Total_Conso_CP'),
    taux_conso_moyen_ae:          n('Taux_Conso_Moyen_AE'),
    taux_conso_moyen_cp:          n('Taux_Conso_Moyen_CP'),

    // === FRAIS DE MISSION ===
    total_frais_mission:          n('Total_Frais_Mission'),
    total_transport:              n('Total_Transport'),
    total_hebergement:            n('Total_Hebergement'),
    total_repas:                  n('Total_Repas'),
    total_formation:              n('Total_Formation'),
    total_autres_missions:        n('Total_Autres_Missions'),
    moyenne_frais_par_agent:      n('Moyenne_Frais_Par_Agent'),
    moy_frais_par_structure:      n('Moy_Frais_Par_Structure'),
    moy_frais_par_agent:          n('Moyenne_Frais_Par_Agent'),
    moy_formation_par_agent:      n('Moy_Formation_Par_Agent'),
    moy_autres_par_agent:         n('Moy_Autres_Par_Agent'),

    // === INFORMATIQUE ===
    total_budget_it:              n('Total_Budget_IT'),
    total_budget_it_4ans:         n('Total_Budget_IT_4ans'),
    moyenne_budget_it_par_agent:  n('Moyenne_Budget_IT_Par_Agent'),
    moy_budget_it_par_agent:      n('Moyenne_Budget_IT_Par_Agent'),
    moy_ratio_poste_agent:        n('Moy_Ratio_Poste_Agent'),
    moy_budget_it_moyen_4ans:     n('Moy_Budget_IT_Moyen_Par_Agent_4ans'),

    // === FONCTIONNEMENT ===
    moy_fonct_par_agent:          n('Moy_Fonct_CP_Par_Agent'),
    moy_fonct_par_agent_4ans:     n('Moy_Fonct_Par_Agent_4ans'),
    moy_pct_maitrisable:          n('Moy_Pct_Maitrisable'),

    // === FONCTIONNEMENT ===
    moy_fonct_par_agent:          n('Moy_Fonct_CP_Par_Agent'),
    moy_fonct_par_agent_4ans:     n('Moy_Fonct_Par_Agent_4ans'),
    moy_pct_maitrisable:          n('Moy_Pct_Maitrisable'),

    // === IMMOBILIER ===
    moy_ratio_occupation:         n('Moy_Ratio_Occupation'),
    moy_cout_surfacique:          n('Moy_Cout_Surfacique'),

    // === BUDGET (table Budget) ===
    moy_taux_ae_vehicules:        n('Moy_Taux_AE_vehicules'),
    moy_taux_cp_vehicules:        n('Moy_Taux_CP_vehicules'),
    moy_taux_ae_fonctionnement:   n('Moy_Taux_AE_fonctionnement'),
    moy_taux_cp_fonctionnement:   n('Moy_Taux_CP_fonctionnement'),
    moy_taux_ae_t6:               n('Moy_Taux_AE_T6'),
    moy_taux_cp_t6:               n('Moy_Taux_CP_T6'),
    moy_taux_ae_immo:             n('Moy_Taux_AE_Immo'),
    moy_taux_cp_immo:             n('Moy_Taux_CP_Immo'),
  };
}

// ═══════════════════════════════════════════════════════════════
// FORMATAGE DES NOMBRES
// ═══════════════════════════════════════════════════════════════

function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

function formatCurrency(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return num.toFixed(decimals) + ' %';
}

// ═══════════════════════════════════════════════════════════════
// GRAPHIQUES (Chart.js)
// ═══════════════════════════════════════════════════════════════

function createGaugeChart(canvasId, value, max, label, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  const pct = (value / max) * 100;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: [color, '#E5E7EB'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
  
  // Afficher le pourcentage au centre
  const parent = ctx.parentElement;
  const label_el = document.createElement('div');
  label_el.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;';
  label_el.innerHTML = `<div style="font-size:24px;font-weight:600;color:${color}">${pct.toFixed(1)}%</div><div style="font-size:12px;color:#6B7280;margin-top:4px;">${label}</div>`;
  parent.style.position = 'relative';
  parent.appendChild(label_el);
}

function createBarChart(canvasId, labels, data, label, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: color,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function createPieChart(canvasId, labels, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  // Détruire le graphique existant s'il existe
  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 15, font: { size: 11 } }
        }
      }
    }
  });
}

function createStackedAreaChart(canvasId, historique) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  // Détruire le graphique existant s'il existe
  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }
  
  const labels = historique.map(h => h.annee);
  const dataAGCO = historique.map(h => h.agco);
  const dataSU = historique.map(h => h.su);
  const dataAutres = historique.map(h => h.autres);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'AGCO',
          data: dataAGCO,
          backgroundColor: 'rgba(0, 123, 255, 0.5)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 2,
          fill: true
        },
        {
          label: 'SU',
          data: dataSU,
          backgroundColor: 'rgba(25, 135, 84, 0.5)',
          borderColor: 'rgba(25, 135, 84, 1)',
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Autres',
          data: dataAutres,
          backgroundColor: 'rgba(255, 193, 7, 0.5)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 2,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 15, font: { size: 11 } }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: 'Année' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: 'ETPT' }
        }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// GESTION DES COMMENTAIRES
// ═══════════════════════════════════════════════════════════════

function getCommentaire(structureId, annee, section) {
  const comments = FICHE_STATE.data.commentaires;
  if (!comments || !comments.id) return '';
  
  const idx = comments.id.findIndex((id, i) => 
    comments.Structure[i] === structureId &&
    comments.Annee[i] === annee &&
    comments.Section[i] === section
  );
  
  return idx !== -1 ? (comments.Commentaire[idx] || '') : '';
}

async function saveCommentaire(structureId, annee, section, commentaire) {
  const comments = FICHE_STATE.data.commentaires;
  if (!comments) return;
  
  // Chercher si un commentaire existe déjà
  const existingIdx = comments.id.findIndex((id, i) => 
    comments.Structure[i] === structureId &&
    comments.Annee[i] === annee &&
    comments.Section[i] === section
  );
  
  const now = new Date().toISOString();
  
  try {
    if (existingIdx !== -1) {
      // UPDATE
      await grist.docApi.applyUserActions([
        ['UpdateRecord', 'Commentaires', comments.id[existingIdx], {
          Commentaire: commentaire,
          Date_Modification: now
        }]
      ]);
    } else {
      // INSERT
      await grist.docApi.applyUserActions([
        ['AddRecord', 'Commentaires', null, {
          Structure: structureId,
          Annee: annee,
          Section: section,
          Commentaire: commentaire,
          Date_Creation: now,
          Date_Modification: now
        }]
      ]);
    }
    
    // Recharger les commentaires
    const newComments = await grist.docApi.fetchTable('Commentaires');
    FICHE_STATE.data.commentaires = newComments;
    
  } catch (err) {
  }
}

// ═══════════════════════════════════════════════════════════════
// ÉDITEURS MARKDOWN (EasyMDE)
// ═══════════════════════════════════════════════════════════════

// Registre des instances EasyMDE actives { textareaId: EasyMDE }
const _mdeInstances = {};

/**
 * Initialise un éditeur EasyMDE sur un textarea donné.
 * Idempotent : si un éditeur existe déjà pour cet ID, le détruit d'abord.
 */
function initMDE(textareaId, initialValue, onSave) {
  if (_mdeInstances[textareaId]) {
    try { _mdeInstances[textareaId].toTextArea(); } catch(e) {}
    delete _mdeInstances[textareaId];
  }
  // toTextArea() restaure le textarea mais laisse le wrapper .EasyMDEContainer dans le DOM.
  // On le supprime explicitement pour éviter que le nouvel éditeur hérite du contenu précédent.
  const textarea = document.getElementById(textareaId);
  if (!textarea) return null;
  // Le wrapper est soit le parent direct, soit un frère précédent du textarea
  const parent = textarea.parentNode;
  if (parent) {
    const wrapper = parent.querySelector('.EasyMDEContainer');
    if (wrapper && wrapper !== textarea) wrapper.remove();
  }

  const mde = new EasyMDE({
    element: textarea,
    initialValue: initialValue || '',
    autofocus: false,
    spellChecker: false,
    status: false,
    autosave: { enabled: false },
    minHeight: '80px',
    toolbar: [
      'bold', 'italic', '|',
      'unordered-list', 'ordered-list', '|',
      'preview', '|',
      {
        name: 'clean-block',
        action: EasyMDE.cleanBlock,
        className: 'fa fa-eraser',
        title: 'Nettoyer le formatage'
      }
    ],
    renderingConfig: { singleLineBreaks: true },
    sideBySideFullscreen: false,
    placeholder: textarea.getAttribute('placeholder') || 'Saisir un commentaire…'
  });

  mde.codemirror.on('blur', function() {
    if (onSave) onSave(mde.value());
  });
  mde.codemirror.addKeyMap({
    'Ctrl-S': function() { if (onSave) onSave(mde.value()); },
    'Cmd-S':  function() { if (onSave) onSave(mde.value()); },
    // Bloquer F9 (side-by-side) et F11 (fullscreen) — incompatibles avec iframe Grist
    'F9':  function() {},
    'F11': function() {}
  });

  // Bug EasyMDE : initialValue='' ne vide pas CodeMirror si un contenu existait.
  // On force le setValue après montage pour garantir la valeur initiale.
  if (!initialValue) {
    mde.codemirror.setValue('');
  }

  _mdeInstances[textareaId] = mde;
  return mde;
}

/** Met à jour la valeur d'un éditeur MDE sans déclencher de sauvegarde. */
function setMDEValue(textareaId, value) {
  const mde = _mdeInstances[textareaId];
  if (mde) {
    mde.value(value || '');
    mde.codemirror.setCursor({ line: 0, ch: 0 });
  }
}

/** Récupère la valeur Markdown d'un éditeur MDE. */
function getMDEValue(textareaId) {
  const mde = _mdeInstances[textareaId];
  return mde ? mde.value() : '';
}

/** Détruit tous les éditeurs MDE actifs (changement de structure). */
function destroyAllMDE() {
  Object.keys(_mdeInstances).forEach(id => {
    const mde = _mdeInstances[id];
    // Récupérer le textarea avant destruction pour nettoyer le wrapper résiduel
    const textarea = mde.element || document.getElementById(id);
    const parent = textarea ? textarea.parentNode : null;
    try { mde.toTextArea(); } catch(e) {}
    // Supprimer le wrapper .EasyMDEContainer laissé dans le DOM par toTextArea()
    if (parent) {
      const wrapper = parent.querySelector('.EasyMDEContainer');
      if (wrapper) wrapper.remove();
    }
    delete _mdeInstances[id];
  });
}

/** Convertit du Markdown en HTML pour affichage en lecture. */
function mdToHtml(md) {
  if (!md || !md.trim()) return '';
  if (typeof marked === 'undefined') return md.replace(/\n/g, '<br>');
  return marked.parse(md, { breaks: true, gfm: true });
}

/**
 * Initialise un éditeur MDE sur une section et le connecte à Grist.
 * Remplace le pattern répétitif textarea.value + textarea.onblur.
 */
function initSectionMDE(textareaId, structureId, annee, section) {
  const initialValue = getCommentaire(structureId, annee, section);
  initMDE(textareaId, initialValue, (value) => {
    saveCommentaire(structureId, annee, section, value);
    _renderCommentDateLabel(textareaId, new Date());
  });

  // Lire la date de dernière modification depuis Grist
  const comments = FICHE_STATE.data.commentaires;
  if (comments && comments.id) {
    const idx = comments.id.findIndex((id, i) =>
      comments.Structure[i] === structureId &&
      comments.Annee[i] === annee &&
      comments.Section[i] === section
    );
    if (idx !== -1 && comments.Date_Modification?.[idx]) {
      const raw = comments.Date_Modification[idx];
      // Grist stocke les dates comme timestamp en secondes (number) ou ISO string
      const d = typeof raw === 'number' ? new Date(raw * 1000) : new Date(raw);
      if (!isNaN(d)) _renderCommentDateLabel(textareaId, d);
    }
  }
}

function _renderCommentDateLabel(textareaId, date) {
  const labelId = textareaId + '-date-label';
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;
  // Chercher le container parent (div encapsulant le textarea et l'éditeur MDE)
  const container = textarea.parentNode;
  if (!container) return;
  let label = document.getElementById(labelId);
  if (!label) {
    label = document.createElement('div');
    label.id = labelId;
    label.style.cssText = 'font-size:10px;color:var(--gris3);text-align:right;margin-top:4px;padding-right:2px;';
    container.appendChild(label);
  }
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  label.textContent = `Modifié le ${fmt.format(date)}`;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT PDF/HTML
// ═══════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

function showLoader(message = 'Chargement...') {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
    loader.querySelector('.loader-text').textContent = message;
  }
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

function showError(message) {
  const error = document.getElementById('error');
  if (error) {
    error.style.display = 'block';
    error.textContent = message;
  }
  hideLoader();
}

// ═══════════════════════════════════════════════════════════════
// FONCTIONS À IMPLÉMENTER PAR CHAQUE GABARIT
// ═══════════════════════════════════════════════════════════════

// onDataLoaded() - Appelée après chargement des données
// refreshFiche() - Rafraîchir l'affichage avec les nouvelles données
// ═══════════════════════════════════════════════════════════════
// MODULE BUDGET
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// RÉCUPÉRATION DONNÉES BUDGET
// ═══════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════
// MODULE FRAIS DE MISSION
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les données frais de mission pour une structure et une année
 * @param {number} structureId - ID de la structure
 * @param {number} annee - Année
 * @returns {Object|null} Données frais de mission
 */
function getFraisMissionData(structureId, annee) {
  const fraisMission = FICHE_STATE.data.frais_mission;
  if (!fraisMission) return null;
  
  const idx = fraisMission.id.findIndex((id, i) => 
    fraisMission.Structure[i] === structureId && 
    fraisMission.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    montant_total: fraisMission.Montant_Total?.[idx] || 0,
    total_formation: fraisMission.Total_Formation?.[idx] || 0,
    total_autres: fraisMission.Total_Autres?.[idx] || 0,
    total_transport: fraisMission.Total_Transport?.[idx] || 0,
    total_repas: fraisMission.Total_Repas?.[idx] || 0,
    total_hebergement: fraisMission.Total_Hebergement?.[idx] || 0,
    formation_transport: fraisMission.Formation_Transport?.[idx] || 0,
    formation_repas: fraisMission.Formation_Repas?.[idx] || 0,
    formation_hebergement: fraisMission.Formation_Hebergement?.[idx] || 0,
    autres_transport: fraisMission.Autres_Transport?.[idx] || 0,
    autres_repas: fraisMission.Autres_Repas?.[idx] || 0,
    autres_hebergement: fraisMission.Autres_Hebergement?.[idx] || 0,
    frais_par_agent: fraisMission.Frais_Par_Agent?.[idx] || 0,
    formation_par_agent: fraisMission.Formation_Par_Agent?.[idx] || 0,
    autres_par_agent: fraisMission.Autres_Par_Agent?.[idx] || 0,
    pct_formation: fraisMission.Pct_Formation?.[idx] || 0,
    pct_autres: fraisMission.Pct_Autres?.[idx] || 0
  };
}

/**
 * Récupère les moyennes consolidées pour frais de mission
 * @param {string} perimetre - Type de périmètre (National, DI, SCN, Outremer, Metropole)
 * @param {number} annee - Année
 * @returns {Object|null} Moyennes consolidées
 */
function getFraisMissionMoyennes(perimetre, annee) {
  const conso = getConsolidationData(perimetre, annee);
  
  if (!conso) {
    return null;
  }
  return {
    moy_frais_par_structure: conso.moy_frais_par_structure || 0,
    moy_frais_par_agent: conso.moy_frais_par_agent || 0,
    moy_formation_par_agent: conso.moy_formation_par_agent || 0,
    moy_autres_par_agent: conso.moy_autres_par_agent || 0
  };
}

/**
 * Détermine le périmètre de comparaison pour une structure
 * @param {number} structureId - ID de la structure
 * @returns {string} Périmètre (DI, SCN, Outremer, Metropole)
 */
function getPerimetreFraisMission(structureId) {
  const structures = FICHE_STATE.data.structures;
  if (!structures) return 'National';
  
  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return 'National';
  
  const type = structures.Type?.[idx];
  const estOutremer = structures.Est_Outremer?.[idx];
  
  if (type === 'SCN') return 'SCN';
  if (type === 'DI' && estOutremer) return 'Outremer';
  if (type === 'DI' && !estOutremer) return 'Metropole';
  if (type === 'DR') return 'Metropole'; // Les DR sont comparées aux DI Métropole
  
  return 'National';
}

/**
 * Calcule l'intitulé du périmètre pour l'affichage
 * @param {string} perimetre - Code périmètre
 * @returns {string} Libellé pour affichage
 */
function getLibellePerimetreFraisMission(perimetre) {
  const labels = {
    'Metropole': 'DI Métropole',
    'Outremer': 'Outre-Mer',
    'SCN': 'SCN',
    'National': 'National'
  };
  return labels[perimetre] || perimetre;
}

/**
 * Récupère les données frais de mission pour plusieurs années (pour graphiques et tableau)
 * @param {number} structureId - ID de la structure
 * @param {Array<number>} annees - Liste des années à récupérer
 * @returns {Array<Object>} Données par année
 */
function getFraisMissionMultiAnnees(structureId, annees) {
  return annees.map(annee => {
    const data = getFraisMissionData(structureId, annee);
    return {
      annee: annee,
      ...(data || {})
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// MODULE INFORMATIQUE
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les données informatique pour une structure et une année
 * @param {number} structureId - ID de la structure
 * @param {number} annee - Année
 * @returns {Object|null} Données informatique
 */

/**
 * Récupère les moyennes consolidées pour informatique
 * @param {string} perimetre - Type de périmètre (National, DI, SCN, Outremer, Metropole)
 * @param {number} annee - Année
 * @returns {Object|null} Moyennes consolidées
 */

/**
 * Détermine le périmètre de comparaison pour une structure (IT)
 * @param {number} structureId - ID de la structure
 * @returns {string} Périmètre (DI, SCN, Outremer, Metropole)
 */

/**
 * Calcule l'intitulé du périmètre pour l'affichage (IT)
 * @param {string} perimetre - Code périmètre
 * @returns {string} Libellé pour affichage
 */

/**
 * Récupère les données informatique pour plusieurs années
 * @param {number} structureId - ID de la structure
 * @param {Array<number>} annees - Liste des années à récupérer
 * @returns {Array<Object>} Données par année
 */

// ═══════════════════════════════════════════════════════════════
// MODULE INFORMATIQUE
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les données informatique pour une structure et une année
 * @param {number} structureId - ID de la structure
 * @param {number} annee - Année
 * @returns {Object|null} Données informatique
 */
function getInformatiqueData(structureId, annee) {
  // Stratégie hybride :
  // - Inventaire postes (Nb_Portables, Nb_Fixes, etc.) : table Informatique brute
  // - Budget IT : Consolidation_Structure en priorité car les DI ont Budget_IT_CP=0
  //   dans la table brute (non rempli manuellement), mais Consolidation_Structure
  //   calcule l'agrégat correct (DI + DR rattachées)

  const informatique = FICHE_STATE.data.informatique;
  const consolData = getConsolidationStructureData(structureId, annee);

  // Données inventaire depuis table brute
  let nb_portables = 0, nb_fixes = 0, nb_postes_travail = 0;
  let effectif_ref = 0, ratio_poste_agent = 0, pct_portables = 0;

  if (informatique) {
    const idx = informatique.id.findIndex((id, i) =>
      informatique.Structure[i] === structureId &&
      informatique.Annee[i] === annee
    );
    if (idx !== -1) {
      nb_portables      = informatique.Nb_Portables?.[idx] || 0;
      nb_fixes          = informatique.Nb_Fixes?.[idx] || 0;
      nb_postes_travail = informatique.Nb_Postes_Travail?.[idx] || 0;
      effectif_ref      = informatique.Effectif_Ref?.[idx] || 0;
      ratio_poste_agent = informatique.Ratio_Poste_Agent?.[idx] || 0;
      pct_portables     = informatique.Pct_Portables?.[idx] || 0;
    }
  }

  // Fallback inventaire depuis Consolidation_Structure si table brute vide (ex: DI 972)
  if (nb_postes_travail === 0 && consolData) {
    nb_portables      = consolData.portables || 0;
    nb_fixes          = consolData.postes_fixes || 0;
    nb_postes_travail = consolData.nb_postes_total || 0;
    effectif_ref      = consolData.effectif_total || 0;
    ratio_poste_agent = consolData.taux_equipement || 0;
    pct_portables     = consolData.pct_portables || 0;
  }

  // Données budget depuis Consolidation_Structure (agrégat fiable DI+DR)
  // Fallback sur table brute si Consolidation_Structure indisponible
  let budget_it_cp = 0, budget_it_moyen_4ans = 0;
  let budget_it_par_agent = 0, budget_it_moyen_par_agent_4ans = 0;

  if (consolData) {
    budget_it_cp                   = consolData.budget_it_cp || 0;
    budget_it_moyen_4ans           = consolData.budget_it_4ans || 0;
    budget_it_par_agent            = consolData.budget_it_par_agent || 0;
    budget_it_moyen_par_agent_4ans = consolData.budget_it_par_agent_4ans || 0;
  } else if (informatique) {
    const idx = informatique.id.findIndex((id, i) =>
      informatique.Structure[i] === structureId &&
      informatique.Annee[i] === annee
    );
    if (idx !== -1) {
      budget_it_cp                   = informatique.Budget_IT_CP?.[idx] || 0;
      budget_it_moyen_4ans           = informatique.Budget_IT_Moyen_4ans?.[idx] || 0;
      budget_it_par_agent            = informatique.Budget_IT_Par_Agent?.[idx] || 0;
      budget_it_moyen_par_agent_4ans = informatique.Budget_IT_Moyen_Par_Agent_4ans?.[idx] || 0;
    }
  }

  // Si aucune donnée du tout
  if (nb_postes_travail === 0 && budget_it_cp === 0 && !consolData) return null;

  return {
    nb_portables,
    nb_fixes,
    nb_postes_travail,
    budget_it: budget_it_cp,
    budget_it_cp,
    budget_it_moyen_4ans,
    effectif_ref,
    ratio_poste_agent,
    pct_portables,
    budget_it_par_agent,
    budget_it_moyen_par_agent_4ans
  };
}

/**
 * Récupère les moyennes consolidées pour informatique
 * @param {string} perimetre - Type de périmètre (National, DI, SCN, Outremer, Metropole)
 * @param {number} annee - Année
 * @returns {Object|null} Moyennes consolidées
 */
function getInformatiqueMoyennes(perimetre, annee) {
  const consolidation = FICHE_STATE.data.consolidation;
  if (!consolidation) return null;
  
  const idx = consolidation.id.findIndex((id, i) => 
    consolidation.Perimetre?.[i] === perimetre && 
    consolidation.Annee?.[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    moy_ratio_poste_agent: consolidation.Moy_Ratio_Poste_Agent?.[idx] || 0,
    moy_budget_it_par_agent: consolidation.Moy_Budget_IT_Par_Agent?.[idx] || 0,
    moy_budget_it_moyen_par_agent_4ans: consolidation.Moy_Budget_IT_Moyen_Par_Agent_4ans?.[idx] || 0
  };
}

/**
 * Détermine le périmètre de comparaison pour une structure (IT)
 * @param {number} structureId - ID de la structure
 * @returns {string} Périmètre (DI, SCN, Outremer, Metropole)
 */
function getPerimetreInformatique(structureId) {
  const structures = FICHE_STATE.data.structures;
  if (!structures) return 'National';
  
  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return 'National';
  
  const type = structures.Type?.[idx];
  const estOutremer = structures.Est_Outremer?.[idx];
  
  if (type === 'SCN') return 'SCN';
  if (type === 'DI' && estOutremer) return 'Outremer';
  if (type === 'DI' && !estOutremer) return 'Metropole';
  if (type === 'DR') return 'Metropole';
  
  return 'National';
}

/**
 * Calcule l'intitulé du périmètre pour l'affichage (IT)
 * @param {string} perimetre - Code périmètre
 * @returns {string} Libellé pour affichage
 */
function getLibellePerimetreInformatique(perimetre) {
  const labels = {
    'Metropole': 'DI Métropole',
    'Outremer': 'Outre-Mer',
    'SCN': 'SCN',
    'National': 'National'
  };
  return labels[perimetre] || perimetre;
}

/**
 * Récupère les données informatique pour plusieurs années
 * @param {number} structureId - ID de la structure
 * @param {Array<number>} annees - Liste des années à récupérer
 * @returns {Array<Object>} Données par année
 */
function getInformatiqueMultiAnnees(structureId, annees) {
  return annees.map(annee => {
    const data = getInformatiqueData(structureId, annee);
    return {
      annee: annee,
      ...(data || {})
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// MODULE VÉHICULES
// ═══════════════════════════════════════════════════════════════
 
/**
 * Rafraîchit l'affichage de l'indicateur Véhicules
 * @param {number} structureId - ID de la structure
 * @param {number} annee - Année de référence
 */
function refreshVehicules(structureId, annee) {
  const data = getVehiculesData(structureId, annee);
  if (!data) {
    // Afficher placeholder si pas de données - vider TOUS les champs
    document.getElementById('veh-total-value').textContent = '—';
    document.getElementById('veh-total-evol').innerHTML = '';
    document.getElementById('veh-total-comp').innerHTML = '';
    
    document.getElementById('veh-budget-value').textContent = '—';
    document.getElementById('veh-budget-evol').innerHTML = '';
    document.getElementById('veh-budget-comp').innerHTML = '';
    
    document.getElementById('veh-ratio-value').textContent = '—';
    document.getElementById('veh-ratio-evol').innerHTML = '';
    document.getElementById('veh-ratio-comp').innerHTML = '';
    
    document.getElementById('veh-cout-value').textContent = '—';
    document.getElementById('veh-cout-evol').innerHTML = '';
    document.getElementById('veh-cout-comp').innerHTML = '';
    
    document.getElementById('veh-ratio-su-value').textContent = '—';
    document.getElementById('veh-ratio-su-evol').innerHTML = '';
    document.getElementById('veh-ratio-su-comp').innerHTML = '';
    
    // Détruire les graphiques
    const chartVetuste = Chart.getChart('chart-veh-vetuste');
    if (chartVetuste) chartVetuste.destroy();
    const chartBudget = Chart.getChart('chart-veh-budget');
    if (chartBudget) chartBudget.destroy();
    
    // Vider le tableau
    const tbody = document.getElementById('table-veh-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--orange); font-style: italic;">⚠️ Aucune donnée véhicules disponible</td></tr>';
    }
    
    // Vider le commentaire
    setMDEValue('veh-commentaire', '');
    
    return;
  }
  
  // Récupérer données N-1 pour évolution
  const dataN1 = getVehiculesData(structureId, annee - 1);
  
  // Récupérer données consolidation pour comparaisons
  const perimetre = getPerimetreStructure(structureId);
  const consol = getConsolidationData(perimetre, annee);
  const consolNational = getConsolidationData('National', annee);
  
  // ========== KPI PILLS ==========
  
  // 1. Total Véhicules
  document.getElementById('veh-total-value').textContent = formatNumber(data.nombre_total, 0);
  
  // Évolution N vs N-1
  if (dataN1) {
    const evolTotal = data.nombre_total - dataN1.nombre_total;
    const evolPctTotal = dataN1.nombre_total > 0 ? (evolTotal / dataN1.nombre_total) * 100 : 0;
    document.getElementById('veh-total-evol').innerHTML = `
      <span style="color:${evolTotal >= 0 ? '#10b981' : '#ef4444'};">
        ${evolTotal >= 0 ? '▲' : '▼'} ${Math.abs(evolPctTotal).toFixed(1)}%
      </span>
      <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>
    `;
  } else {
    document.getElementById('veh-total-evol').textContent = '';
  }
  
  // Comparaison vs périmètre (utilise Moy_Nb_Vehicules)
  if (consol && consol.moy_nb_vehicules && consol.moy_nb_vehicules > 0) {
    const ecart = data.nombre_total - consol.moy_nb_vehicules;
    const ecartPct = (ecart / consol.moy_nb_vehicules) * 100;
    document.getElementById('veh-total-comp').innerHTML = `
      <span style="color:var(--gris2);">
        ${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs moyenne ${perimetre}
      </span>
    `;
  } else {
    document.getElementById('veh-total-comp').textContent = '';
  }
  
  // 3. Budget Total (en K€)
  document.getElementById('veh-budget-value').textContent = formatNumber(data.budget_total / 1000, 0) + ' K€';
  
  // Évolution budget
  if (dataN1) {
    const evolBudget = data.budget_total - dataN1.budget_total;
    const evolPctBudget = dataN1.budget_total > 0 ? (evolBudget / dataN1.budget_total) * 100 : 0;
    document.getElementById('veh-budget-evol').innerHTML = `
      <span style="color:${evolBudget >= 0 ? '#ef4444' : '#10b981'};">
        ${evolBudget >= 0 ? '▲' : '▼'} ${Math.abs(evolPctBudget).toFixed(1)}%
      </span>
      <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>
    `;
  } else {
    document.getElementById('veh-budget-evol').textContent = '';
  }
  
  // Comparaison budget vs périmètre (utilise Moy_Budget_Vehicules)
  if (consol && consol.moy_budget_vehicules && consol.moy_budget_vehicules > 0) {
    const ecart = data.budget_total - consol.moy_budget_vehicules;
    const ecartPct = (ecart / consol.moy_budget_vehicules) * 100;
    document.getElementById('veh-budget-comp').innerHTML = `
      <span style="color:var(--gris2);">
        ${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs ${perimetre}
      </span>
    `;
  } else {
    document.getElementById('veh-budget-comp').textContent = '';
  }
  
  // 4. Ratio Véhicule/Agent
  document.getElementById('veh-ratio-value').textContent = formatNumber(data.ratio_vehicule_agent, 3);
  
  // Évolution ratio
  if (dataN1) {
    const evolRatio = data.ratio_vehicule_agent - dataN1.ratio_vehicule_agent;
    document.getElementById('veh-ratio-evol').innerHTML = `
      <span style="color:${evolRatio >= 0 ? '#10b981' : '#ef4444'};">
        ${evolRatio >= 0 ? '▲' : '▼'} ${Math.abs(evolRatio).toFixed(3)}
      </span>
      <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>
    `;
  } else {
    document.getElementById('veh-ratio-evol').textContent = '';
  }
  
  // Comparaison ratio vs périmètre ET national
  const compRatio = [];
  if (consol && consol.moy_ratio_vehicule_agent && consol.moy_ratio_vehicule_agent > 0) {
    const ecart = data.ratio_vehicule_agent - consol.moy_ratio_vehicule_agent;
    const ecartPct = (ecart / consol.moy_ratio_vehicule_agent) * 100;
    compRatio.push(`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs ${perimetre}`);
  }
  if (consolNational && consolNational.moy_ratio_vehicule_agent && consolNational.moy_ratio_vehicule_agent > 0) {
    const ecart = data.ratio_vehicule_agent - consolNational.moy_ratio_vehicule_agent;
    const ecartPct = (ecart / consolNational.moy_ratio_vehicule_agent) * 100;
    compRatio.push(`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs National`);
  }
  if (compRatio.length > 0) {
    document.getElementById('veh-ratio-comp').innerHTML = `
      <span style="color:var(--gris2);">
        ${compRatio.join(' | ')}
      </span>
    `;
  } else {
    document.getElementById('veh-ratio-comp').textContent = '';
  }
  
  // 5. Coût fonctionnement par véhicule
  document.getElementById('veh-cout-value').textContent = formatCurrency(data.cout_fonct_vehicule, 0);
  
  // Évolution coût
  if (dataN1 && dataN1.cout_fonct_vehicule) {
    const evolCout = data.cout_fonct_vehicule - dataN1.cout_fonct_vehicule;
    const evolPctCout = dataN1.cout_fonct_vehicule > 0 ? (evolCout / dataN1.cout_fonct_vehicule) * 100 : 0;
    document.getElementById('veh-cout-evol').innerHTML = `
      <span style="color:${evolCout >= 0 ? '#ef4444' : '#10b981'};">
        ${evolCout >= 0 ? '▲' : '▼'} ${Math.abs(evolPctCout).toFixed(1)}%
      </span>
      <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>
    `;
  } else {
    document.getElementById('veh-cout-evol').textContent = '';
  }
  
  // Comparaison coût vs périmètre ET national — lit Moy_Cout_Fonctionnement_Par_Vehicule depuis Grist
  const compCout = [];
  if (consol && consol.moy_cout_fonct_vehicule && consol.moy_cout_fonct_vehicule > 0) {
    const ecart = data.cout_fonct_vehicule - consol.moy_cout_fonct_vehicule;
    const ecartPct = (ecart / consol.moy_cout_fonct_vehicule) * 100;
    compCout.push(`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs ${perimetre}`);
  }
  if (consolNational && consolNational.moy_cout_fonct_vehicule && consolNational.moy_cout_fonct_vehicule > 0) {
    const ecart = data.cout_fonct_vehicule - consolNational.moy_cout_fonct_vehicule;
    const ecartPct = (ecart / consolNational.moy_cout_fonct_vehicule) * 100;
    compCout.push(`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs National`);
  }
  if (compCout.length > 0) {
    document.getElementById('veh-cout-comp').innerHTML = `
      <span style="color:var(--gris2);">
        ${compCout.join(' | ')}
      </span>
    `;
  } else {
    document.getElementById('veh-cout-comp').textContent = '';
  }
  
  // 6. Ratio véhicule / SU — masqué si aucun agent SU (ratio nul)
  const pillRatioSU = document.getElementById('veh-pill-ratio-su');
  const hasSU = data.ratio_vehicule_su && data.ratio_vehicule_su !== 0;
  if (pillRatioSU) pillRatioSU.style.display = hasSU ? '' : 'none';
  if (hasSU) {
    document.getElementById('veh-ratio-su-value').textContent = formatNumber(data.ratio_vehicule_su, 3);
    
    // Évolution ratio SU
    if (dataN1 && dataN1.ratio_vehicule_su) {
      const evolRatioSU = data.ratio_vehicule_su - dataN1.ratio_vehicule_su;
      document.getElementById('veh-ratio-su-evol').innerHTML = `
        <span style="color:${evolRatioSU >= 0 ? '#10b981' : '#ef4444'};">
          ${evolRatioSU >= 0 ? '▲' : '▼'} ${Math.abs(evolRatioSU).toFixed(3)}
        </span>
        <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>
      `;
    } else {
      document.getElementById('veh-ratio-su-evol').textContent = '';
    }
    
    // Comparaison ratio SU vs périmètre ET national
    const compRatioSU = [];
    if (consol && consol.moy_ratio_vehicule_su && consol.moy_ratio_vehicule_su > 0) {
      const ecart = data.ratio_vehicule_su - consol.moy_ratio_vehicule_su;
      const ecartPct = (ecart / consol.moy_ratio_vehicule_su) * 100;
      compRatioSU.push(`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs ${perimetre}`);
    }
    if (consolNational && consolNational.moy_ratio_vehicule_su && consolNational.moy_ratio_vehicule_su > 0) {
      const ecart = data.ratio_vehicule_su - consolNational.moy_ratio_vehicule_su;
      const ecartPct = (ecart / consolNational.moy_ratio_vehicule_su) * 100;
      compRatioSU.push(`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs National`);
    }
    if (compRatioSU.length > 0) {
      document.getElementById('veh-ratio-su-comp').innerHTML = `
        <span style="color:var(--gris2);">
          ${compRatioSU.join(' | ')}
        </span>
      `;
    } else {
      document.getElementById('veh-ratio-su-comp').textContent = '';
    }
  }
  
  // ========== GRAPHIQUES ==========
  
  // Graphique Vétusté (camembert)
  createVehiculesVetustePieChart(data);
  
  // Graphique Budget Fonct/Invest (barres empilées)
  createVehiculesBudgetChart(structureId);
  
  // ========== TABLEAU MULTI-ANNÉES ==========
  
  createVehiculesTable(structureId);
}
 
/**
 * Crée le graphique camembert de vétusté
 */
function createVehiculesVetustePieChart(data) {
  const ctx = document.getElementById('chart-veh-vetuste');
  if (!ctx) return;
  
  // Détruire ancien graphique si existe
  if (window.chartVehVetuste) {
    window.chartVehVetuste.destroy();
  }
  
  const nbOk = data.nombre_total - data.nombre_vetuste;
  
  window.chartVehVetuste = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Vétustes', 'Récents'],
      datasets: [{
        data: [data.nombre_vetuste, nbOk],
        backgroundColor: ['#ef4444', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            padding: 15,
            font: { size: 12 },
            generateLabels: function(chart) {
              const data = chart.data;
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label}: ${value} (${pct}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} véhicules (${pct}%)`;
            }
          }
        }
      }
    }
  });
}
 
/**
 * Crée le graphique Budget Fonctionnement/Investissement (barres empilées)
 */
function createVehiculesBudgetChart(structureId) {
  const ctx = document.getElementById('chart-veh-budget');
  if (!ctx) return;
  
  // Détruire ancien graphique si existe
  if (window.chartVehBudget) {
    window.chartVehBudget.destroy();
  }
  
  // Récupérer années disponibles
  const annees = getAnneesDisponibles();
  
  const dataFonct = [];
  const dataInvest = [];
  
  annees.forEach(annee => {
    const data = getVehiculesData(structureId, annee);
    if (data) {
      dataFonct.push((data.budget_fonctionnement || 0) / 1000); // Convertir en K€
      dataInvest.push((data.budget_investissement || 0) / 1000);
    } else {
      dataFonct.push(0);
      dataInvest.push(0);
    }
  });
  
  window.chartVehBudget = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: annees,
      datasets: [
        {
          label: 'Fonctionnement',
          data: dataFonct,
          backgroundColor: '#3b82f6',
          borderWidth: 0
        },
        {
          label: 'Investissement',
          data: dataInvest,
          backgroundColor: '#8b5cf6',
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            padding: 15,
            font: { size: 12 }          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + formatNumber(context.parsed.y, 0) + ' K€';
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 12 } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            font: { size: 12 },
            callback: function(value) {
              return formatNumber(value, 0) + ' K€';
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      }
    }
  });
}
 
/**
 * Crée le tableau multi-années pour les véhicules
 */
function createVehiculesTable(structureId) {
  const tbody = document.getElementById('table-veh-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const annees = getAnneesDisponibles();
  
  // Récupérer données de consolidation pour la ligne moyenne
  const perimetre = getPerimetreStructure(structureId);
  
  annees.forEach(annee => {
    const data = getVehiculesData(structureId, annee);
    
    if (data) {
      const row = document.createElement('tr');
      row.style.borderBottom = '0.5px solid var(--bord)';
      
      row.innerHTML = `
        <td style="padding:12px 16px;font-weight:500;font-size:13px;">${annee}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.nombre_total, 0)}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.nombre_vetuste, 0)}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatPercent(data.taux_vetuste)}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.budget_fonctionnement / 1000, 0)} K€</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.budget_investissement / 1000, 0)} K€</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.budget_total / 1000, 0)} K€</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.ratio_vehicule_agent, 3)}</td>
      `;
      
      tbody.appendChild(row);
    }
  });
  
}

// ============================================================================
// MODULE COMMUNICATION
// ============================================================================

/**
 * Récupère les données de dépenses de communication pour une structure.
 * Pour les DI Outremer (ex. DI 972), utilise la ligne Est_Consolide=true
 * qui agrège automatiquement DI + DR rattachées dans Grist.
 *
 * Colonnes Grist attendues :
 *   Structure (Reference), Est_Consolide (Toggle), Date_Import_2026 (Date),
 *   CP_2022, CP_2023, CP_2024, CP_2025, CP_2026, EJ_2026,
 *   Cible_2026, Report_2026, Capacite_EJ_2026, Capacite_CP_2026,
 *   Taux_Conso_2026 (formule Grist), Taux_Conso_2026_Pct (formule Grist)
 *
 * @param {number} structureId - ID de la structure
 * @returns {Object|null}
 */
function getCommunicationData(structureId) {
  const com = FICHE_STATE.data.communication;
  if (!com || !com.Structure) return null;

  // Pour les DI Outremer : chercher d'abord la ligne consolidée
  const structures = FICHE_STATE.data.structures;
  const sIdx = structures ? structures.id.indexOf(structureId) : -1;
  const isOutremerDI = sIdx !== -1
    && structures.Type?.[sIdx] === 'DI'
    && structures.Est_Outremer?.[sIdx];

  let idx = -1;
  if (isOutremerDI && com.Est_Consolide) {
    // Chercher la ligne consolidée pour cette structure
    idx = com.Structure.findIndex((s, i) => s === structureId && com.Est_Consolide[i]);
  }
  // Fallback : ligne normale (non consolidée)
  if (idx === -1) {
    idx = com.Structure.findIndex((s, i) => s === structureId && !com.Est_Consolide?.[i]);
  }
  // Dernier recours : n'importe quelle ligne pour cette structure
  if (idx === -1) {
    idx = com.Structure.indexOf(structureId);
  }
  if (idx === -1) return null;

  const v  = (col) => (com[col] ? (com[col][idx] || 0) : 0);
  const vs = (col) => (com[col] ? (com[col][idx] || null) : null);

  // Taux depuis Grist si disponible, sinon calcul local
  const cp_2026    = v('CP_2026');
  const cible_2026 = v('Cible_2026');
  const taux_grist = v('Taux_Conso_2026');
  const taux       = taux_grist || (cible_2026 ? cp_2026 / cible_2026 : 0);

  // Date d'import : Grist renvoie la chaîne au format MM-DD-YYYY
  const dateRaw = vs('Date_Import_2026');
  let date_import = null;
  if (dateRaw) {
    if (typeof dateRaw === 'string' && dateRaw.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // Format DD-MM-YYYY
      const [dd, mm, yyyy] = dateRaw.split('-');
      date_import = new Date(+yyyy, +mm - 1, +dd);
    } else if (typeof dateRaw === 'number' && dateRaw > 0) {
      // Fallback timestamp secondes
      date_import = new Date(dateRaw * 1000);
    }
  }

  return {
    cp_2022:      v('CP_2022'),
    cp_2023:      v('CP_2023'),
    cp_2024:      v('CP_2024'),
    cp_2025:      v('CP_2025'),
    cp_2026,
    ej_2026:      v('EJ_2026'),
    cible_2026,
    report_2026:  v('Report_2026'),
    cap_ej_2026:  v('Capacite_EJ_2026'),
    cap_cp_2026:  v('Capacite_CP_2026'),
    taux_conso:   taux,
    taux_pct:     Math.round(taux * 1000) / 10,   // 1 décimale
    reste_cible:  cible_2026 - cp_2026,           // = Capacite_CP_2026 normalement
    date_import,
    est_consolide: com.Est_Consolide ? !!com.Est_Consolide[idx] : false
  };
}

/**
 * Récupère le taux de consommation Communication moyen d'un périmètre
 * depuis la table Consolidation (colonne Moy_Taux_Conso_Com).
 * @param {string} perimetre - 'National', 'Metropole', 'Outremer', 'SCN'
 * @param {number} annee
 * @returns {number|null} taux en décimal ou null
 */
function getCommunicationTauxMoyen(perimetre, annee) {
  const conso = FICHE_STATE.data.consolidation;
  if (!conso || !conso.Perimetre) return null;
  const idx = conso.id.findIndex((_, i) =>
    conso.Perimetre[i] === perimetre && conso.Annee[i] === annee
  );
  if (idx === -1) return null;
  return conso.Moy_Taux_Conso_Com?.[idx] ?? null;
}

/**
 * Détermine le périmètre de comparaison pour Communication.
 * Même logique que Frais de Mission.
 * @param {number} structureId
 * @returns {string}
 */
function getPerimetreCommunication(structureId) {
  const structures = FICHE_STATE.data.structures;
  if (!structures) return 'National';
  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return 'National';
  const type       = structures.Type?.[idx];
  const estOutremer = structures.Est_Outremer?.[idx];
  if (type === 'SCN')                    return 'SCN';
  if (type === 'DI' && estOutremer)      return 'Outremer';
  if (type === 'DI' && !estOutremer)     return 'Metropole';
  return 'National';
}

/**
 * Formate un montant en € entier (sans conversion K€).
 * Affiche '—' si nul/absent.
 * @param {number} val - Montant en euros
 * @returns {string}
 */
function formatCommunicationMontant(val) {
  if (val === null || val === undefined || val === 0) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val);
}

/**
 * Retourne couleur et libellé selon le taux de consommation CP/Cible.
 *   < 50 %  → vert   (faible consommation)
 *   50-80 % → orange (consommation modérée)
 *   > 80 %  → rouge  (proche saturation)
 * @param {number} taux - en décimal (0-1+)
 * @returns {{color: string, bg: string, label: string}}
 */
function getCommunicationSaturationStyle(taux) {
  if (taux >= 0.80) return { color: '#c0392b', bg: '#FEF2F2', label: 'Proche saturation' };
  if (taux >= 0.50) return { color: '#d35400', bg: '#FFF7ED', label: 'En cours de consommation' };
  return { color: '#1a6b3c', bg: '#F0FDF4', label: 'Consommation faible' };
}


/**
 * Récupère les lignes DR filles d'une structure DI dans la table Communication.
 * @param {number} structureId - ID de la DI parente
 * @returns {Array<{sigle:string, data:Object}>}
 */
function getCommunicationLignesFilles(structureId) {
  const com = FICHE_STATE.data.communication;
  const structures = FICHE_STATE.data.structures;
  if (!com || !structures) return [];

  const filles = [];
  com.Structure.forEach((sId, i) => {
    if (com.Est_Consolide?.[i]) return;
    const sIdx = structures.id.indexOf(sId);
    if (sIdx === -1) return;
    const parentId = structures.Parent?.[sIdx];
    if (parentId !== structureId) return;

    const v = (col) => (com[col] ? (com[col][i] || 0) : 0);
    const sigle = structures.Sigle?.[sIdx] || `Structure ${sId}`;
    filles.push({
      sigle,
      data: {
        cp_2022:    v('CP_2022'),
        cp_2023:    v('CP_2023'),
        cp_2024:    v('CP_2024'),
        cp_2025:    v('CP_2025'),
        ae_2026:    v('EJ_2026'),
        cp_2026:    v('CP_2026'),
        cible_2026: v('Cible_2026'),
        rap_2026:   v('Report_2026'),
        dispo_ae:   v('Capacite_EJ_2026'),
        dispo_cp:   v('Capacite_CP_2026')
      }
    });
  });
  filles.sort((a, b) => a.sigle.localeCompare(b.sigle));
  return filles;
}

/**
 * Rafraîchit la sous-section Dépenses de Communication.
 * Gère les labels dynamiques avec date, les 3 pills, le KPI saturation,
 * le graphique, et le tableau avec lignes DR filles pour DI Outremer.
 * @param {number} structureId
 * @param {number} annee
 */
function refreshCommunication(structureId, annee) {
  const d   = getCommunicationData(structureId);
  const fmt = formatCommunicationMontant;

  const structures = FICHE_STATE.data.structures;
  const sIdx = structures ? structures.id.indexOf(structureId) : -1;
  const sigle = sIdx !== -1 ? (structures.Sigle?.[sIdx] || '—') : '—';

  const dateFmt = (d && d.date_import && !isNaN(d.date_import))
    ? d.date_import.toLocaleDateString('fr-FR') : null;
  const dateSuffix = dateFmt ? ` au ${dateFmt}` : '';

  // ── Reset complet si pas de données ───────────────────────────
  if (!d) {
    ['com-pill-cible-val','com-pill-cp-val','com-pill-cap-cp-val',
     'com-sat-pct','com-sat-reste','com-sat-label',
     'com-sat-vs-nat','com-sat-vs-per','com-date-import'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const jauge = document.getElementById('com-sat-jauge');
    if (jauge) jauge.style.width = '0%';
    const tbody = document.getElementById('table-com-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:20px;color:var(--orange);font-style:italic;">⚠️ Aucune donnée disponible</td></tr>`;
    const chartExist = Chart.getChart('chart-com-evolution');
    if (chartExist) chartExist.destroy();
    setMDEValue('com-commentaire', '');
    return;
  }

  // ── Date d'import ──────────────────────────────────────────────
  const elDate = document.getElementById('com-date-import');
  if (elDate) {
    if (dateFmt) { elDate.textContent = `Données au ${dateFmt}`; elDate.style.display = ''; }
    else elDate.style.display = 'none';
  }

  // ── Labels dynamiques des pills (point 2) ─────────────────────
  const elLabelCible = document.getElementById('com-pill-cible-label');
  const elLabelCp    = document.getElementById('com-pill-cp-label');
  const elLabelCap   = document.getElementById('com-pill-cap-cp-label');
  if (elLabelCible) elLabelCible.textContent = 'Cible de dépenses 2026 (CP)';
  if (elLabelCp)    elLabelCp.textContent    = `CP 2026${dateSuffix}`;
  if (elLabelCap)   elLabelCap.textContent   = `Disponible en CP 2026${dateSuffix}`;

  // ── Pills (3) — valeurs ────────────────────────────────────────
  const elCible = document.getElementById('com-pill-cible-val');
  const elCp    = document.getElementById('com-pill-cp-val');
  const elCapCp = document.getElementById('com-pill-cap-cp-val');
  if (elCible) elCible.textContent = fmt(d.cible_2026);
  if (elCp)    elCp.textContent    = fmt(d.cp_2026);
  if (elCapCp) elCapCp.textContent = fmt(d.cap_cp_2026);

  // ── Titre barre de progression (point 3) ──────────────────────
  const elSatTitre = document.getElementById('com-sat-titre');
  if (elSatTitre) elSatTitre.textContent = `Consommation par rapport à la cible 2026${dateSuffix}`;

  // ── KPI Saturation ─────────────────────────────────────────────
  const style      = getCommunicationSaturationStyle(d.taux_conso);
  const pctDisplay = d.taux_pct.toFixed(1).replace('.', ',') + ' %';

  const elSatPct   = document.getElementById('com-sat-pct');
  const elSatReste = document.getElementById('com-sat-reste');
  const elSatLabel = document.getElementById('com-sat-label');
  const elSatJauge = document.getElementById('com-sat-jauge');
  const elSatWrap  = document.getElementById('com-sat-wrap');

  if (elSatPct)   { elSatPct.textContent = pctDisplay; elSatPct.style.color = style.color; }
  if (elSatReste) elSatReste.textContent = fmt(d.reste_cible > 0 ? d.reste_cible : 0);
  if (elSatLabel) { elSatLabel.textContent = style.label; elSatLabel.style.color = style.color; }
  if (elSatJauge) { elSatJauge.style.width = Math.min(d.taux_pct, 100) + '%'; elSatJauge.style.background = style.color; }
  if (elSatWrap)  { elSatWrap.style.background = style.bg; elSatWrap.style.borderColor = style.color; }

  // Comparaisons vs périmètre et national
  const perimetre = getPerimetreCommunication(structureId);
  const tauxNat   = getCommunicationTauxMoyen('National', annee);
  const tauxPer   = getCommunicationTauxMoyen(perimetre, annee);
  const libPer    = { Metropole: 'moy. DI Métropole', Outremer: 'moy. Outre-Mer', SCN: 'moy. SCN', National: 'moy. nationale' }[perimetre] || 'moy. périmètre';

  const fmtDelta = (ref, label) => {
    if (ref === null) return null;
    const delta = d.taux_conso - ref;
    const sign  = delta >= 0 ? '+' : '';
    return `${sign}${(delta * 100).toFixed(1).replace('.', ',')} pts vs ${label} (${(ref * 100).toFixed(1).replace('.', ',')} %)`;
  };

  const elVsNat = document.getElementById('com-sat-vs-nat');
  const elVsPer = document.getElementById('com-sat-vs-per');
  const rowPer  = document.getElementById('com-sat-vs-per-row');

  if (elVsNat) {
    const txt = fmtDelta(tauxNat, 'national');
    elVsNat.textContent = txt || '— (moy. nationale non disponible)';
    elVsNat.style.color = tauxNat !== null ? (d.taux_conso > tauxNat ? '#c0392b' : '#1a6b3c') : 'var(--gris3)';
  }
  if (perimetre !== 'National' && elVsPer) {
    const txt = fmtDelta(tauxPer, libPer);
    elVsPer.textContent = txt || `— (${libPer} non disponible)`;
    elVsPer.style.color = tauxPer !== null ? (d.taux_conso > tauxPer ? '#c0392b' : '#1a6b3c') : 'var(--gris3)';
    if (rowPer) rowPer.style.display = '';
  } else {
    if (rowPer) rowPer.style.display = 'none';
  }

  // ── Titre graphique (point 4) ──────────────────────────────────
  const elChartTitle = document.getElementById('com-chart-title');
  if (elChartTitle) elChartTitle.textContent = 'Consommation de CP de 2022 à 2026';

  // ── Graphique évolution CP ─────────────────────────────────────
  const chartExist = Chart.getChart('chart-com-evolution');
  if (chartExist) chartExist.destroy();

  const ctx = document.getElementById('chart-com-evolution');
  if (ctx) {
    const vals   = [d.cp_2022, d.cp_2023, d.cp_2024, d.cp_2025, d.cp_2026];
    const labels = ['CP 2022', 'CP 2023', 'CP 2024', 'CP 2025', `CP 2026${dateSuffix}`];
    const bgH    = 'rgba(0,47,108,0.72)';
    const bgP    = 'rgba(19,81,168,0.45)';

    const datasets = [{
      label: 'CP (€)',
      data: vals.map(v => v || null),
      backgroundColor: [bgH, bgH, bgH, bgH, bgP],
      borderColor: ['rgb(0,47,108)','rgb(0,47,108)','rgb(0,47,108)','rgb(0,47,108)','rgb(19,81,168)'],
      borderWidth: 1.5,
      borderRadius: 4
    }];

    if (d.cible_2026) {
      datasets.push({
        label: 'Cible 2026',
        data: [null, null, null, null, d.cible_2026],
        type: 'scatter',
        pointStyle: 'line',
        pointRadius: 18,
        pointBorderWidth: 2.5,
        pointBorderColor: 'rgb(26,107,60)',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        order: 0
      });
    }

    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: datasets.length > 1, position: 'top', labels: { font: { size: 11 }, boxWidth: 14 } },
          tooltip: { callbacks: { label: (c) => c.parsed.y !== null ? `${c.dataset.label} : ${fmt(c.parsed.y)}` : '' } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => fmt(v), font: { size: 10 } } },
          x: { ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // ── Tableau récapitulatif (points 5–9) ────────────────────────
  const tbody = document.getElementById('table-com-body');
  if (!tbody) return;

  // Chapeau colonnes 2026 (point 6)
  const th2026label = document.getElementById('com-th-2026-label');
  if (th2026label) th2026label.textContent = `Consommation budgétaire 2026${dateSuffix}`;

  // En-têtes CP "Année" (point 5)
  ['2022','2023','2024','2025'].forEach(yr => {
    const th = document.getElementById(`com-th-${yr}`);
    if (th) th.textContent = `CP ${yr}`;
  });

  const tdS  = 'padding:8px 12px;font-weight:600;font-size:12px;';
  const tdN  = 'padding:8px 12px;text-align:right;font-size:12px;';
  const td26 = tdN + 'background:#EEF2FF;';

  const buildRow = (rowSigle, rowData, isChild) => {
    const indent = isChild ? 'padding-left:22px;color:var(--gris2);' : '';
    return `<tr>
      <td style="${tdS}${indent}">${isChild ? '↳ ' : ''}${rowSigle}</td>
      <td style="${tdN}">${fmt(rowData.cp_2022)}</td>
      <td style="${tdN}">${fmt(rowData.cp_2023)}</td>
      <td style="${tdN}">${fmt(rowData.cp_2024)}</td>
      <td style="${tdN}">${fmt(rowData.cp_2025)}</td>
      <td style="${td26}color:var(--orange);">${fmt(rowData.rap_2026)}</td>
      <td style="${td26}">${fmt(rowData.ae_2026)}</td>
      <td style="${td26}">${fmt(rowData.cp_2026)}</td>
      <td style="${td26}color:var(--vert);font-weight:600;">${fmt(rowData.cible_2026)}</td>
      <td style="${td26}color:#6B3FA0;">${fmt(rowData.dispo_ae)}</td>
      <td style="${td26}color:#6B3FA0;">${fmt(rowData.dispo_cp)}</td>
    </tr>`;
  };

  const mainData = {
    cp_2022: d.cp_2022, cp_2023: d.cp_2023, cp_2024: d.cp_2024, cp_2025: d.cp_2025,
    ae_2026: d.ej_2026, cp_2026: d.cp_2026, cible_2026: d.cible_2026,
    rap_2026: d.report_2026, dispo_ae: d.cap_ej_2026, dispo_cp: d.cap_cp_2026
  };

  let html = buildRow(sigle, mainData, false);
  getCommunicationLignesFilles(structureId).forEach(f => {
    html += buildRow(f.sigle, f.data, true);
  });
  tbody.innerHTML = html;

  // ── Commentaire ────────────────────────────────────────────────
  initSectionMDE('com-commentaire', structureId, annee, 'Communication');
}


// ============================================================================
// MODULE FONCTIONNEMENT COURANT
// ============================================================================

/**
 * Récupère les données de fonctionnement courant pour une structure.
 * La table Fonctionnement a une ligne par structure (pas de dimension Annee).
 * Pour DI 972 : cherche d'abord la ligne Est_Consolide=true.
 * @param {number} structureId
 * @returns {Object|null}
 */
function getFonctionnementData(structureId) {
  const fon = FICHE_STATE.data.fonctionnement;
  if (!fon || !fon.Structure) return null;

  const structures = FICHE_STATE.data.structures;
  const sIdx = structures ? structures.id.indexOf(structureId) : -1;
  const isOutremerDI = sIdx !== -1
    && structures.Type?.[sIdx] === 'DI'
    && structures.Est_Outremer?.[sIdx];

  let idx = -1;
  if (isOutremerDI && fon.Est_Consolide) {
    idx = fon.Structure.findIndex((s, i) => s === structureId && fon.Est_Consolide[i]);
  }
  if (idx === -1) {
    idx = fon.Structure.findIndex((s, i) => s === structureId && !fon.Est_Consolide?.[i]);
  }
  if (idx === -1) {
    idx = fon.Structure.indexOf(structureId);
  }
  if (idx === -1) return null;

  const v = (col) => (fon[col] ? (fon[col][idx] || 0) : 0);

  return {
    cp_2022:              v('CP_2022'),
    cp_2023:              v('CP_2023'),
    cp_2024:              v('CP_2024'),
    cp_2025:              v('CP_2025'),
    cp_2022_m:            v('CP_2022_maitrisable'),
    cp_2023_m:            v('CP_2023_maitrisable'),
    cp_2024_m:            v('CP_2024_maitrisable'),
    cp_2025_m:            v('CP_2025_maitrisable'),
    evol_cp_4ans:         v('Evol_CP_4ans'),
    evol_pct_maitrisable: v('Evol_Pct_Maitrisable'),
    pct_m_2022:           v('Pct_maitrisable_2022'),
    pct_m_2023:           v('Pct_maitrisable_2023'),
    pct_m_2024:           v('Pct_maitrisable_2024'),
    pct_m_2025:           v('Pct_maitrisable_2025'),
    fonct_agent_2022:     v('Fonct_agent_2022'),
    fonct_agent_2023:     v('Fonct_agent_2023'),
    fonct_agent_2024:     v('Fonct_agent_2024'),
    fonct_agent_2025:     v('Fonct_agent_2025'),
    fonct_agent_4ans:     v('Fonct_agent_4ans'),
  };
}

/**
 * Détermine le périmètre de comparaison pour Fonctionnement.
 * @param {number} structureId
 * @returns {string}
 */
function getPerimetreFonctionnement(structureId) {
  const structures = FICHE_STATE.data.structures;
  if (!structures) return 'National';
  const idx = structures.id.indexOf(structureId);
  if (idx === -1) return 'National';
  const type        = structures.Type?.[idx];
  const estOutremer = structures.Est_Outremer?.[idx];
  if (type === 'SCN')                   return 'SCN';
  if (type === 'DI' && estOutremer)     return 'Outremer';
  if (type === 'DI' && !estOutremer)    return 'DI';
  if (type === 'DR')                    return 'DR';
  return 'National';
}

/**
 * Formate un montant Fonctionnement en K€.
 * @param {number} val - Montant en euros
 * @returns {string}
 */
function formatFonctMontant(val) {
  if (!val) return '—';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(val / 1000)) + ' K€';
}

/**
 * Construit le bloc de comparaison vs National et vs Périmètre.
 * Pour les dépenses : au-dessus de la moyenne = défavorable (inverser=true).
 * @param {number} val - Valeur de la structure
 * @param {number|null} moyNat - Moyenne nationale
 * @param {number|null} moyPer - Moyenne périmètre
 * @param {boolean} inverser - true si au-dessus = défavorable
 * @returns {string} HTML
 */
function buildFonctComparison(val, moyNat, moyPer, inverser, libPerimetre) {
  if (!val) return '';
  let html = '';

  const libPer = libPerimetre || 'moy. périmètre';

  const buildLine = (moy, labelRef) => {
    if (!moy) return;
    const diff = ((val - moy) / moy) * 100;
    const absDiff = Math.abs(diff);
    if (absDiff < 1) {
      html += `<div style="font-size:10px;color:var(--gris3);">≈ ${labelRef} (dépenses similaires)</div>`;
      return;
    }
    const enHaut = diff > 0;
    const mauvais = inverser ? enHaut : !enHaut;
    const color = mauvais ? 'var(--rouge)' : 'var(--vert)';
    const sign = enHaut ? '+' : '−';
    const sens = inverser
      ? (enHaut ? 'dépense plus élevée' : 'dépense plus faible')
      : (enHaut ? 'part plus élevée' : 'part plus faible');
    html += `<div style="font-size:10px;color:${color};">${sign}${absDiff.toFixed(1)} % vs ${labelRef} <span style="opacity:0.75;">(${sens})</span></div>`;
  };

  buildLine(moyNat, 'moy. nationale');
  buildLine(moyPer, libPer);

  return html;
}

/**
 * Rafraîchit la section Fonctionnement courant.
 * @param {number} structureId
 * @param {number} annee
 */
function refreshFonctionnement(structureId, annee) {
  const d = getFonctionnementData(structureId);

  // ── Données absentes ───────────────────────────────────────────
  if (!d) {
    ['fonct-pill-evol', 'fonct-pill-pct-m', 'fonct-pill-agent-2025', 'fonct-pill-agent-4ans'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const tbody = document.getElementById('fonct-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--orange);font-style:italic;">⚠️ Aucune donnée disponible</td></tr>';
    initSectionMDE('fonct-commentaire', structureId, annee, 'Fonctionnement');
    return;
  }

  // ── Moyennes de comparaison depuis Consolidation ──────────────
  const perimetre = getPerimetreFonctionnement(structureId);
  const consoNat  = getConsolidationData('National', annee);
  const consoPer  = perimetre !== 'National' ? getConsolidationData(perimetre, annee) : null;
  const libPerimetre = { DI: 'moy. DI Métropole', Outremer: 'moy. DI Outremer', SCN: 'moy. SCN', DR: 'moy. DR' }[perimetre] || null;

  // ── PILL 1 : Mini-graphe barres CP total 2022→2025 ───────────
  const pill1 = document.getElementById('fonct-pill-evol');
  if (pill1) {
    const evol  = d.evol_cp_4ans;
    const sign  = evol >= 0 ? '+' : '';
    const colorEvol = evol > 5 ? 'var(--rouge)' : evol < -5 ? 'var(--vert)' : 'var(--gris2)';
    const anneesBars = [2022, 2023, 2024, 2025];
    const valsBars   = [d.cp_2022, d.cp_2023, d.cp_2024, d.cp_2025].map(v => v || 0);
    const maxVal = Math.max(...valsBars, 1);
    const fmtK = v => v >= 1000 ? Math.round(v / 1000) + ' K€' : v + ' €';
    const barsHtml = anneesBars.map((a, i) => {
      const pct    = Math.round((valsBars[i] / maxVal) * 100);
      const isLast = i === 3;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;">
          <div style="font-size:9px;color:var(--gris3);white-space:nowrap;">${fmtK(valsBars[i])}</div>
          <div style="width:100%;height:40px;display:flex;align-items:flex-end;">
            <div style="width:100%;height:${pct}%;background:${isLast ? 'var(--rep)' : '#A8CEF0'};border-radius:2px 2px 0 0;min-height:3px;"></div>
          </div>
          <div style="font-size:9px;color:${isLast ? 'var(--rep)' : 'var(--gris3)'};font-weight:${isLast ? '600' : '400'};">${a}</div>
        </div>`;
    }).join('');
    pill1.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px;">
        <span style="font-size:22px;font-weight:700;color:${colorEvol};">${sign}${evol.toFixed(1)} %</span>
        <span style="font-size:10px;color:var(--gris3);">sur 4 ans</span>
      </div>
      <div style="display:flex;gap:4px;align-items:flex-end;padding:0 2px;">${barsHtml}</div>`;
    const det = document.getElementById('fonct-pill-evol-detail');
    if (det) det.innerHTML = `<div style="font-size:10px;color:var(--gris3);margin-top:4px;">${fmtK(d.cp_2022)} → ${fmtK(d.cp_2025)}</div>`;
  }

  // ── PILL 2 : Mini-graphe barres dépenses maîtrisables 2022→2025
  const pill2 = document.getElementById('fonct-pill-pct-m');
  if (pill2) {
    const valsM  = [d.cp_2022_m, d.cp_2023_m, d.cp_2024_m, d.cp_2025_m].map(v => v || 0);
    const maxM   = Math.max(...valsM, 1);
    const evolMPct = valsM[0] > 0 ? ((valsM[3] - valsM[0]) / valsM[0]) * 100 : null;
    const signM  = evolMPct !== null ? (evolMPct >= 0 ? '+' : '') : '';
    const colorM = evolMPct === null ? 'var(--gris2)' : evolMPct > 5 ? 'var(--rouge)' : evolMPct < -5 ? 'var(--vert)' : 'var(--gris2)';
    const fmtK = v => v >= 1000 ? Math.round(v / 1000) + ' K€' : v + ' €';
    const barsM = [2022, 2023, 2024, 2025].map((a, i) => {
      const pct    = Math.round((valsM[i] / maxM) * 100);
      const isLast = i === 3;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;">
          <div style="font-size:9px;color:var(--gris3);white-space:nowrap;">${fmtK(valsM[i])}</div>
          <div style="width:100%;height:40px;display:flex;align-items:flex-end;">
            <div style="width:100%;height:${pct}%;background:${isLast ? 'var(--rep)' : '#A8CEF0'};border-radius:2px 2px 0 0;min-height:3px;"></div>
          </div>
          <div style="font-size:9px;color:${isLast ? 'var(--rep)' : 'var(--gris3)'};font-weight:${isLast ? '600' : '400'};">${a}</div>
        </div>`;
    }).join('');
    pill2.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px;">
        ${evolMPct !== null
          ? `<span style="font-size:22px;font-weight:700;color:${colorM};">${signM}${evolMPct.toFixed(1)} %</span><span style="font-size:10px;color:var(--gris3);">sur 4 ans</span>`
          : `<span style="font-size:22px;font-weight:700;color:var(--gris3);">—</span>`}
      </div>
      <div style="display:flex;gap:4px;align-items:flex-end;padding:0 2px;">${barsM}</div>`;
    const det2 = document.getElementById('fonct-pill-pct-m-detail');
    if (det2) det2.innerHTML = `<div style="font-size:10px;color:var(--gris3);margin-top:4px;">${fmtK(valsM[0])} → ${fmtK(valsM[3])}</div>`;
  }

  // ── PILL 3 : Part des dépenses maîtrisables 2025 + comparaison
  const pill3 = document.getElementById('fonct-pill-agent-2025');
  if (pill3) {
    const pct   = d.pct_m_2025;
    const evol  = d.evol_pct_maitrisable;
    const sign  = evol >= 0 ? '+' : '';
    const colorEvol = evol > 2 ? 'var(--rouge)' : evol < -2 ? 'var(--vert)' : 'var(--gris3)';
    pill3.innerHTML = `<span style="font-size:22px;font-weight:700;color:var(--rep);">${pct.toFixed(1)} %</span>`;
    const det3 = document.getElementById('fonct-pill-agent-2025-detail');
    if (det3) {
      const evolHtml = `<div style="font-size:10px;color:${colorEvol};">Évolution : ${sign}${evol.toFixed(1)} pt (2022→2025)</div>`;
      const cmpHtml  = buildFonctComparison(pct, consoNat?.moy_pct_maitrisable || null, consoPer?.moy_pct_maitrisable || null, false, libPerimetre);
      det3.innerHTML = evolHtml + cmpHtml;
    }
  }

  // ── PILL 4 : Dépenses maîtrisables / ETPT lissé 4 ans ────────
  const pill4 = document.getElementById('fonct-pill-agent-4ans');
  if (pill4) {
    const val = d.fonct_agent_4ans;
    pill4.innerHTML = `<span style="font-size:22px;font-weight:700;color:var(--rep);">${formatCurrency(val)}</span>`;
    const det4 = document.getElementById('fonct-pill-agent-4ans-detail');
    if (det4) det4.innerHTML = buildFonctComparison(val, consoNat?.moy_fonct_par_agent_4ans || null, consoPer?.moy_fonct_par_agent_4ans || null, true, libPerimetre);
  }

  // ── Tableau multi-années ──────────────────────────────────────
  const tbody = document.getElementById('fonct-tbody');
  if (tbody) {
    const fmt    = formatFonctMontant;
    const fmtPct = (v) => v ? v.toFixed(1) + ' %' : '—';
    const fmtEur = (v) => v ? formatCurrency(v) : '—';

    tbody.innerHTML = `
      <tr>
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">Dépenses de fonctionnement courant en CP</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2022)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2023)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2024)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmt(d.cp_2025)}</td>
      </tr>
      <tr style="background:var(--gris4);">
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">dont dépenses maîtrisables en CP</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2022_m)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2023_m)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2024_m)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmt(d.cp_2025_m)}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">Part des dépenses maîtrisables</td>
        <td style="padding:8px 12px;text-align:right;">${fmtPct(d.pct_m_2022)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmtPct(d.pct_m_2023)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmtPct(d.pct_m_2024)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmtPct(d.pct_m_2025)}</td>
      </tr>
      <tr style="background:var(--gris4);">
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">Dépenses maîtrisables par ETPT</td>
        <td style="padding:8px 12px;text-align:right;">${fmtEur(d.fonct_agent_2022)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmtEur(d.fonct_agent_2023)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmtEur(d.fonct_agent_2024)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmtEur(d.fonct_agent_2025)}</td>
      </tr>`;
  }

  // ── Commentaire ────────────────────────────────────────────────
  initSectionMDE('fonct-commentaire', structureId, annee, 'Fonctionnement');
}


// ============================================================================
// MODULE EXPORT PDF/HTML
// ============================================================================

// ══════════════════════════════════════════════════════════════════════
// MODULE RH
// ══════════════════════════════════════════════════════════════════════

function refreshRH(structureId, annee) {
  const dataN = getRHData(structureId, annee);
  const dataNMoins1 = getRHData(structureId, annee - 1);
  
  
  if (!dataN) {
    
    // Effacer tous les champs
    document.getElementById('rh-effectif-total').textContent = '—';
    document.getElementById('rh-effectif-evolution').textContent = '—';
    document.getElementById('rh-effectif-compare').textContent = '—';
    document.getElementById('rh-effectif-rang').textContent = '—';
    document.getElementById('rh-agco-total').textContent = '—';
    document.getElementById('rh-agco-evolution').textContent = '—';
    document.getElementById('rh-agco-compare').textContent = '—';
    document.getElementById('rh-su-total').textContent = '—';
    document.getElementById('rh-su-evolution').textContent = '—';
    document.getElementById('rh-su-compare').textContent = '—';
    document.getElementById('rh-age-moyen').textContent = '—';
    document.getElementById('rh-age-compare-groupe').textContent = '—';
    document.getElementById('rh-age-compare-national').textContent = '—';
    document.getElementById('rh-ms-par-agent').textContent = '—';
    document.getElementById('rh-ms-compare-groupe').textContent = '—';
    document.getElementById('rh-ms-compare-national').textContent = '—';
    
    // Vider le tableau
    document.getElementById('rh-detail-tbody').innerHTML = '';
    document.getElementById('rh-detail-tfoot').innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 20px; color: var(--orange); font-style: italic;">
          ⚠️ Aucune donnée RH disponible pour cette structure (${FICHE_STATE.structure.sigle || FICHE_STATE.structure.nom})
        </td>
      </tr>
    `;
    
    // Détruire les graphiques
    const chartEvolution = Chart.getChart('chart-rh-evolution');
    if (chartEvolution) chartEvolution.destroy();
    
    const chartRepartition = Chart.getChart('chart-rh-repartition');
    if (chartRepartition) chartRepartition.destroy();
    
    // Réinitialiser le commentaire pour la structure courante
    initSectionMDE('rh-commentaire', structureId, annee, 'RH');
    
    return;
  }
  
  // KPI - Effectif Total avec évolution, comparaison et rang
  document.getElementById('rh-effectif-total').textContent = formatNumber(dataN.effectif_total);
  
  // Évolution temporelle
  if (dataNMoins1) {
    const diffEffectif = Math.round(dataN.effectif_total - dataNMoins1.effectif_total);
    const pctEvolution = dataNMoins1.effectif_total > 0 ? Math.round(diffEffectif / dataNMoins1.effectif_total * 1000) / 10 : 0;
    const color = diffEffectif >= 0 ? 'var(--vert)' : 'var(--rouge)';
    const symbol = diffEffectif >= 0 ? '+' : '';
    document.getElementById('rh-effectif-evolution').innerHTML = `<span style="color: ${color};">${symbol}${diffEffectif} (${symbol}${pctEvolution}%)</span> vs ${annee - 1}`;
  }
  
  // Comparaison au groupe
  const type = FICHE_STATE.structure.type;
  const consoGroupe = getConsolidationData(type, annee);
  
  // Comparaison effectif total : non pertinente (valeurs absolues liées à la taille)
  document.getElementById('rh-effectif-compare').innerHTML = '';
  
  // Rang
  const rang = getRangStructure(structureId, annee, 'effectif_total');
  if (rang) {
    document.getElementById('rh-effectif-rang').innerHTML = `Rang: ${rang.rang}/${rang.total} ${type}`;
  }
  
  // KPI - AGCO avec évolution et comparaison
  document.getElementById('rh-agco-total').textContent = formatNumber(dataN.effectif_agco);
  if (dataNMoins1) {
    const diffAGCO = Math.round(dataN.effectif_agco - dataNMoins1.effectif_agco);
    const pctEvolution = dataNMoins1.effectif_agco > 0 ? Math.round(diffAGCO / dataNMoins1.effectif_agco * 1000) / 10 : 0;
    const color = diffAGCO >= 0 ? 'var(--vert)' : 'var(--rouge)';
    const symbol = diffAGCO >= 0 ? '+' : '';
    document.getElementById('rh-agco-evolution').innerHTML = `<span style="color: ${color};">${symbol}${diffAGCO} (${symbol}${pctEvolution}%)</span> vs ${annee - 1}`;
  }
  
  // Comparaison effectif AGCO : non pertinente (valeurs absolues liées à la taille)
  document.getElementById('rh-agco-compare').innerHTML = '';
  
  // KPI - SU avec évolution et comparaison
  document.getElementById('rh-su-total').textContent = formatNumber(dataN.effectif_su);
  if (dataNMoins1) {
    const diffSU = Math.round(dataN.effectif_su - dataNMoins1.effectif_su);
    const pctEvolution = dataNMoins1.effectif_su > 0 ? Math.round(diffSU / dataNMoins1.effectif_su * 1000) / 10 : 0;
    const color = diffSU >= 0 ? 'var(--vert)' : 'var(--rouge)';
    const symbol = diffSU >= 0 ? '+' : '';
    document.getElementById('rh-su-evolution').innerHTML = `<span style="color: ${color};">${symbol}${diffSU} (${symbol}${pctEvolution}%)</span> vs ${annee - 1}`;
  }
  
  // Comparaison effectif SU : non pertinente (valeurs absolues liées à la taille)
  document.getElementById('rh-su-compare').innerHTML = '';
  
  // KPI - Âge Moyen avec comparaisons
  const ageMoyen = dataN.effectif_total > 0 ? 
    Math.round((dataN.age_moyen_agco * dataN.effectif_agco + dataN.age_moyen_su * dataN.effectif_su + dataN.age_moyen_autres * dataN.effectif_autres) / dataN.effectif_total * 10) / 10 : 0;
  document.getElementById('rh-age-moyen').textContent = formatNumber(ageMoyen, 1);
  
  // Comparaison âge moyen avec groupe (depuis Consolidation)
  if (consoGroupe && consoGroupe.age_moyen_global > 0) {
    const ageMoyenGroupe = consoGroupe.age_moyen_global;
    const diffAge = Math.round((ageMoyen - ageMoyenGroupe) * 10) / 10;
    const colorAge = diffAge >= 0 ? 'var(--rouge)' : 'var(--vert)'; // Inversé : plus jeune = mieux
    const symbolAge = diffAge >= 0 ? '+' : '';
    document.getElementById('rh-age-compare-groupe').innerHTML = `vs Moy. ${type}: <span style="color: ${colorAge};">${symbolAge}${diffAge} ans</span>`;
  } else {
  }
  
  // Comparaison âge moyen avec National (depuis Consolidation)
  const consoNational = getConsolidationData('National', annee);
  if (consoNational && consoNational.age_moyen_global > 0) {
    const ageMoyenNational = consoNational.age_moyen_global;
    const diffAge = Math.round((ageMoyen - ageMoyenNational) * 10) / 10;
    const colorAge = diffAge >= 0 ? 'var(--rouge)' : 'var(--vert)';
    const symbolAge = diffAge >= 0 ? '+' : '';
    document.getElementById('rh-age-compare-national').innerHTML = `vs National: <span style="color: ${colorAge};">${symbolAge}${diffAge} ans</span>`;
  }
  
  // KPI - MS / Agent avec comparaisons
  const msParAgent = dataN.effectif_total > 0 ? Math.round(dataN.masse_salariale / dataN.effectif_total) : 0;
  document.getElementById('rh-ms-par-agent').textContent = formatCurrency(msParAgent, 0);
  
  // Comparaison MS/Agent avec groupe
  if (consoGroupe && consoGroupe.moyenne_ms_par_agent) {
    const diffMS = msParAgent - consoGroupe.moyenne_ms_par_agent;
    const pctDiffMS = consoGroupe.moyenne_ms_par_agent > 0 ? Math.round(diffMS / consoGroupe.moyenne_ms_par_agent * 1000) / 10 : 0;
    const colorMS = diffMS >= 0 ? 'var(--vert)' : 'var(--rouge)';
    const symbolMS = diffMS >= 0 ? '+' : '';
    document.getElementById('rh-ms-compare-groupe').innerHTML = `vs Moy. ${type}: <span style="color: ${colorMS};">${symbolMS}${formatCurrency(Math.abs(diffMS), 0)} (${symbolMS}${pctDiffMS}%)</span>`;
  } else {
    document.getElementById('rh-ms-compare-groupe').innerHTML = '';
  }
  
  // Comparaison MS/Agent avec National
  if (consoNational && consoNational.moyenne_ms_par_agent) {
    const diffMS = msParAgent - consoNational.moyenne_ms_par_agent;
    const pctDiffMS = consoNational.moyenne_ms_par_agent > 0 ? Math.round(diffMS / consoNational.moyenne_ms_par_agent * 1000) / 10 : 0;
    const colorMS = diffMS >= 0 ? 'var(--vert)' : 'var(--rouge)';
    const symbolMS = diffMS >= 0 ? '+' : '';
    document.getElementById('rh-ms-compare-national').innerHTML = `vs National: <span style="color: ${colorMS};">${symbolMS}${formatCurrency(Math.abs(diffMS), 0)} (${symbolMS}${pctDiffMS}%)</span>`;
  } else {
    document.getElementById('rh-ms-compare-national').innerHTML = '';
  }
  
  // Tableau détaillé par DR (uniquement pour les DI)
  const details = getRHDetailParDR(structureId, annee);
  const tbody = document.getElementById('rh-detail-tbody');
  const tfoot = document.getElementById('rh-detail-tfoot');
  tbody.innerHTML = '';
  
  if (details && details.length > 0) {
    // Afficher le tableau pour les DI
    details.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${d.sigle}</strong></td>
        <td style="text-align: right;">${formatNumber(d.effectif_total)}</td>
        <td style="text-align: center;">${formatNumber(d.effectif_agco)}</td>
        <td style="text-align: center;">${formatNumber(d.effectif_su)}</td>
        <td style="text-align: center;">${formatNumber(d.effectif_autres)}</td>
        <td style="text-align: right;">${formatCurrency(d.masse_salariale, 0)}</td>
        <td style="text-align: right;">${formatCurrency(d.ms_par_agent, 0)}</td>
        <td style="text-align: center;">${formatNumber(d.age_moyen_total, 1)}</td>
      `;
      tbody.appendChild(tr);
    });
    
    // Ligne TOTAL
    const msParAgent = dataN.effectif_total > 0 ? Math.round(dataN.masse_salariale / dataN.effectif_total) : 0;
    tfoot.innerHTML = `
      <tr>
        <td>TOTAL</td>
        <td style="text-align: right;">${formatNumber(dataN.effectif_total)}</td>
        <td style="text-align: center;">${formatNumber(dataN.effectif_agco)}</td>
        <td style="text-align: center;">${formatNumber(dataN.effectif_su)}</td>
        <td style="text-align: center;">${formatNumber(dataN.effectif_autres)}</td>
        <td style="text-align: right;">${formatCurrency(dataN.masse_salariale, 0)}</td>
        <td style="text-align: right;">${formatCurrency(msParAgent, 0)}</td>
        <td style="text-align: center;">${formatNumber(ageMoyen, 1)}</td>
      </tr>
    `;
  } else {
    // Pour Siège/SCN : afficher juste les totaux sans détail par DR
    const msParAgent = dataN.effectif_total > 0 ? Math.round(dataN.masse_salariale / dataN.effectif_total) : 0;
    tfoot.innerHTML = `
      <tr>
        <td><strong>${FICHE_STATE.structure.sigle || FICHE_STATE.structure.nom}</strong></td>
        <td style="text-align: right;">${formatNumber(dataN.effectif_total)}</td>
        <td style="text-align: center;">${formatNumber(dataN.effectif_agco)}</td>
        <td style="text-align: center;">${formatNumber(dataN.effectif_su)}</td>
        <td style="text-align: center;">${formatNumber(dataN.effectif_autres)}</td>
        <td style="text-align: right;">${formatCurrency(dataN.masse_salariale, 0)}</td>
        <td style="text-align: right;">${formatCurrency(msParAgent, 0)}</td>
        <td style="text-align: center;">${formatNumber(ageMoyen, 1)}</td>
      </tr>
    `;
  }
  
  // Graphique évolution (toute la série)
  const historique = getRHHistorique(structureId);
  createStackedAreaChart('chart-rh-evolution', historique);
  
  // Graphique répartition AGCO / SU avec pourcentages
  const pctAGCO = dataN.pct_agco;
  const pctSU = dataN.pct_su;
  createPieChart('chart-rh-repartition', 
    [`AGCO (${formatPercent(pctAGCO)})`, `SU (${formatPercent(pctSU)})`],
    [dataN.effectif_agco, dataN.effectif_su],
    ['#007bff', '#198754']
  );
  
  // Charger le commentaire RH
  initSectionMDE('rh-commentaire', structureId, annee, 'RH');
}

function refreshBudget(structureId, annee) {

  annee = 2026;

  const dataN = getBudgetData(structureId, annee);
  const perimetre = getPerimetreBudget(structureId);
  const libPerimetre = { 'Metropole': 'DI Métropole', 'SCN': 'SCN', 'Outremer': 'Outremer', 'National': 'National' }[perimetre] || perimetre;
  const moyPerimetre = getBudgetMoyennes(perimetre, annee);
  const moyNational  = getBudgetMoyennes('National', annee);

  // ── Vider si pas de données ───────────────────────────────
  if (!dataN) {
    ['budget-pill-taux-ae','budget-pill-taux-cp',
     'budget-pill-montants-ae','budget-pill-montants-cp',
     'budget-pill-ae-groupe','budget-pill-ae-national',
     'budget-pill-cp-groupe','budget-pill-cp-national'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '—';
    });
    ['chart-budget-radar-ae','chart-budget-taux-cp','chart-budget-evol'].forEach(id => {
      const c = Chart.getChart(id); if (c) c.destroy();
    });
    const tbody = document.getElementById('budget-types-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--orange);font-style:italic;">⚠️ Aucune donnée budgétaire disponible pour ' + annee + '</td></tr>';
    initSectionMDE('budget-commentaire', structureId, annee, 'Budget');
    return;
  }

  // ── Date import ───────────────────────────────────────────
  const elDate = document.getElementById('budget-date-import');
  if (elDate) {
    if (dataN.date_import && !isNaN(dataN.date_import)) {
      elDate.textContent = `Données au ${dataN.date_import.toLocaleDateString('fr-FR')}`;
    } else {
      elDate.textContent = '';
    }
  }

  // ── Pills globales ────────────────────────────────────────
  const pctAE = (dataN.taux_ae_total * 100).toFixed(1) + ' %';
  const pctCP = (dataN.taux_cp_total * 100).toFixed(1) + ' %';
  document.getElementById('budget-pill-taux-ae').textContent = pctAE;
  document.getElementById('budget-pill-taux-cp').textContent = pctCP;
  document.getElementById('budget-pill-montants-ae').textContent =
    formatCurrency(dataN.conso_ae_total, 0) + ' / ' + formatCurrency(dataN.dot_ae_total, 0);
  document.getElementById('budget-pill-montants-cp').textContent =
    formatCurrency(dataN.conso_cp_total, 0) + ' / ' + formatCurrency(dataN.dot_cp_total, 0);

  const fmtDiff = (val, moy, label) => {
    if (!moy || moy === 0) return '—';
    const diff = (val - moy) * 100;
    const s = diff >= 0 ? '+' : '';
    return `${label} : ${s}${diff.toFixed(1)} pts`;
  };

  if (moyPerimetre) {
    document.getElementById('budget-pill-ae-groupe').innerHTML =
      fmtDiff(dataN.taux_ae_total, moyPerimetre.taux_ae_total, `Moy. ${libPerimetre}`);
    document.getElementById('budget-pill-cp-groupe').innerHTML =
      fmtDiff(dataN.taux_cp_total, moyPerimetre.taux_cp_total, `Moy. ${libPerimetre}`);
  }
  if (moyNational) {
    document.getElementById('budget-pill-ae-national').innerHTML =
      fmtDiff(dataN.taux_ae_total, moyNational.taux_ae_total, 'National');
    document.getElementById('budget-pill-cp-national').innerHTML =
      fmtDiff(dataN.taux_cp_total, moyNational.taux_cp_total, 'National');
  }

  // ── Radar répartition dotations AE ───────────────────────
  createBudgetRadarAE(dataN, moyPerimetre, libPerimetre);

  // ── Barres taux CP par catégorie ─────────────────────────
  createBudgetTauxCP(dataN, moyPerimetre, moyNational, libPerimetre);

  // ── Évolution multi-années ────────────────────────────────
  createBudgetEvol(structureId);

  // ── Tableau par catégorie ─────────────────────────────────
  createBudgetTable(dataN, moyPerimetre, libPerimetre, annee);

  initSectionMDE('budget-commentaire', structureId, annee, 'Budget');
}

function createBudgetRadarAE(data, moy, libPerimetre) {
  const canvas = document.getElementById('chart-budget-radar-ae');
  if (!canvas) return;
  const existing = Chart.getChart('chart-budget-radar-ae');
  if (existing) existing.destroy();

  const labels = ['Véhicules', 'Fonctionnement', 'T6 Buralistes', 'Immobilier'];

  const tauxStruct = [
    data.taux_cp_vehicules != null ? data.taux_cp_vehicules * 100 : null,
    data.taux_cp_fonctionnement != null ? data.taux_cp_fonctionnement * 100 : null,
    data.taux_cp_t6 != null ? data.taux_cp_t6 * 100 : null,
    data.taux_cp_immo != null ? data.taux_cp_immo * 100 : null,
  ];

  const tauxMoy = moy ? [
    moy.taux_cp_vehicules != null ? moy.taux_cp_vehicules * 100 : null,
    moy.taux_cp_fonctionnement != null ? moy.taux_cp_fonctionnement * 100 : null,
    moy.taux_cp_t6 != null ? moy.taux_cp_t6 * 100 : null,
    moy.taux_cp_immo != null ? moy.taux_cp_immo * 100 : null,
  ] : null;

  const datasets = [];
  if (tauxMoy) {
    datasets.push({
      label: `Moy. ${libPerimetre}`,
      data: tauxMoy,
      backgroundColor: 'rgba(160,160,160,0.20)',
      borderColor: 'rgba(120,120,120,0.65)',
      borderWidth: 2,
      borderDash: [5, 3],
      pointBackgroundColor: 'rgba(120,120,120,0.65)',
      pointRadius: 3,
      pointHoverRadius: 5,
    });
  }
  datasets.push({
    label: 'Cette structure',
    data: tauxStruct,
    backgroundColor: 'rgba(19,81,168,0.18)',
    borderColor: 'rgba(19,81,168,0.9)',
    borderWidth: 2.5,
    pointBackgroundColor: 'rgba(19,81,168,0.9)',
    pointRadius: 4,
    pointHoverRadius: 6,
  });

  new Chart(canvas, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { size: 11 }, boxWidth: 14 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.r;
              return v != null ? `${ctx.dataset.label} : ${v.toFixed(1)} %` : `${ctx.dataset.label} : —`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 25,
            callback: v => v + ' %',
            font: { size: 9 },
            backdropColor: 'transparent',
          },
          pointLabels: { font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,0.08)' },
          angleLines: { color: 'rgba(0,0,0,0.10)' },
        }
      }
    }
  });
}

function createBudgetTauxCP(data, moy, moyNat, libPerimetre) {
  const canvas = document.getElementById('chart-budget-taux-cp');
  if (!canvas) return;
  const existing = Chart.getChart('chart-budget-taux-cp');
  if (existing) existing.destroy();

  const labels = ['Véhicules', 'Fonctionnement', 'T6 Buralistes', 'Immobilier'];
  const structTaux = [
    data.taux_cp_vehicules * 100,
    data.taux_cp_fonctionnement * 100,
    data.taux_cp_t6 * 100,
    data.taux_cp_immo * 100,
  ];
  const moyTaux = moy ? [
    moy.taux_cp_vehicules * 100,
    moy.taux_cp_fonctionnement * 100,
    moy.taux_cp_t6 * 100,
    moy.taux_cp_immo * 100,
  ] : null;

  const datasets = [{
    label: 'Cette structure',
    data: structTaux,
    backgroundColor: 'rgba(19,81,168,0.7)',
    borderColor: 'rgba(19,81,168,1)',
    borderWidth: 1,
  }];

  if (moyTaux) {
    datasets.push({
      label: `Moy. ${libPerimetre}`,
      data: moyTaux,
      backgroundColor: 'rgba(180,180,180,0.5)',
      borderColor: 'rgba(120,120,120,0.8)',
      borderWidth: 1,
    });
  }

  new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label} : ${ctx.parsed.y.toFixed(1)} %`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => v + ' %', font: { size: 10 } }
        },
        x: { ticks: { font: { size: 10 } } }
      }
    }
  });
}

function createBudgetEvol(structureId) {
  const canvas = document.getElementById('chart-budget-evol');
  if (!canvas) return;
  const existing = Chart.getChart('chart-budget-evol');
  if (existing) existing.destroy();

  const historique = getBudgetHistorique(structureId);
  const annees = Object.keys(historique).map(Number).sort();
  if (annees.length === 0) return;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: annees,
      datasets: [
        {
          label: 'Dotation CP',
          data: annees.map(a => historique[a].dot_cp_total),
          backgroundColor: 'rgba(180,180,180,0.6)',
          borderColor: 'rgba(120,120,120,0.8)',
          borderWidth: 1,
          order: 2,
        },
        {
          label: 'Consommation CP',
          data: annees.map(a => historique[a].conso_cp_total),
          backgroundColor: 'rgba(19,81,168,0.7)',
          borderColor: 'rgba(19,81,168,1)',
          borderWidth: 1,
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label} : ${formatCurrency(ctx.parsed.y, 0)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => formatCurrency(v, 0), font: { size: 10 } }
        },
        x: { ticks: { font: { size: 11 } } }
      }
    }
  });
}

function createBudgetTable(data, moy, libPerimetre, annee) {
  const tbody = document.getElementById('budget-types-tbody');
  if (!tbody) return;
  document.getElementById('budget-table-title').textContent =
    `Exécution budgétaire par catégorie — ${annee}`;

  const categories = [
    { label: 'Véhicules',        dot_ae: data.dot_ae_vehicules,      conso_ae: data.conso_ae_vehicules,      taux_ae: data.taux_ae_vehicules,      dot_cp: data.dot_cp_vehicules,      conso_cp: data.conso_cp_vehicules,      taux_cp: data.taux_cp_vehicules,      moy_cp: moy?.taux_cp_vehicules },
    { label: 'Fonctionnement',   dot_ae: data.dot_ae_fonctionnement,  conso_ae: data.conso_ae_fonctionnement, taux_ae: data.taux_ae_fonctionnement,  dot_cp: data.dot_cp_fonctionnement,  conso_cp: data.conso_cp_fonctionnement, taux_cp: data.taux_cp_fonctionnement,  moy_cp: moy?.taux_cp_fonctionnement },
    { label: 'T6 Buralistes',    dot_ae: data.dot_ae_t6,             conso_ae: data.conso_ae_t6,            taux_ae: data.taux_ae_t6,             dot_cp: data.dot_cp_t6,             conso_cp: data.conso_cp_t6,            taux_cp: data.taux_cp_t6,            moy_cp: moy?.taux_cp_t6 },
    { label: 'Immobilier',       dot_ae: data.dot_ae_immo,           conso_ae: data.conso_ae_immo,          taux_ae: data.taux_ae_immo,           dot_cp: data.dot_cp_immo,           conso_cp: data.conso_cp_immo,          taux_cp: data.taux_cp_immo,          moy_cp: moy?.taux_cp_immo },
    { label: '<strong>Total</strong>', dot_ae: data.dot_ae_total, conso_ae: data.conso_ae_total, taux_ae: data.taux_ae_total, dot_cp: data.dot_cp_total, conso_cp: data.conso_cp_total, taux_cp: data.taux_cp_total, moy_cp: moy?.taux_cp_total, isTotal: true },
  ];

  const fmtTaux = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '—';
    const pct = v * 100;
    const color = pct >= 80 ? 'var(--rouge)' : pct >= 50 ? 'var(--orange)' : 'var(--vert)';
    return `<span style="color:${color};font-weight:600;">${pct.toFixed(1)} %</span>`;
  };
  const fmtMoy = (v) => {
    if (v === null || v === undefined || isNaN(v) || v === 0) return '—';
    return `${(v * 100).toFixed(1)} %`;
  };

  tbody.innerHTML = categories.map(c => `
    <tr${c.isTotal ? ' style="font-weight:600;border-top:2px solid var(--bord);background:var(--gris4);"' : ''}>
      <td>${c.label}</td>
      <td style="text-align:right;">${formatCurrency(c.dot_ae, 0)}</td>
      <td style="text-align:right;">${formatCurrency(c.conso_ae, 0)}</td>
      <td style="text-align:right;">${fmtTaux(c.taux_ae)}</td>
      <td style="text-align:right;">${formatCurrency(c.dot_cp, 0)}</td>
      <td style="text-align:right;">${formatCurrency(c.conso_cp, 0)}</td>
      <td style="text-align:right;">${fmtTaux(c.taux_cp)}</td>
      <td style="text-align:right;color:var(--gris2);">${fmtMoy(c.moy_cp)}</td>
    </tr>`).join('');
}

function refreshFraisMission(structureId, annee) {
  // Année courante et année précédente
  const anneeCourante = annee;
  const anneePrecedente = annee - 1;
  
  // Récupérer données
  const dataCourante = getFraisMissionData(structureId, anneeCourante);
  const dataPrecedente = getFraisMissionData(structureId, anneePrecedente);
  
  if (!dataCourante) {

// Vider tous les KPIs
document.getElementById('fm-total-value').textContent = '—';
document.getElementById('fm-total-evol').className = 'fm-evolution-badge';
document.getElementById('fm-total-evol').innerHTML = '';
document.getElementById('fm-total-comp').innerHTML = '';

document.getElementById('fm-formation-value').textContent = '—';
document.getElementById('fm-formation-evol').className = 'fm-evolution-badge';
document.getElementById('fm-formation-evol').innerHTML = '';
document.getElementById('fm-formation-pct').textContent = '';

document.getElementById('fm-autres-value').textContent = '—';
document.getElementById('fm-autres-evol').className = 'fm-evolution-badge';
document.getElementById('fm-autres-evol').innerHTML = '';
document.getElementById('fm-autres-pct').textContent = '';

document.getElementById('fm-agent-value').textContent = '—';
document.getElementById('fm-agent-evol').className = 'fm-evolution-badge';
document.getElementById('fm-agent-evol').innerHTML = '';
document.getElementById('fm-agent-comp').innerHTML = '';

// Détruire le graphique
const chartFM = Chart.getChart('chart-fm-repartition');
if (chartFM) chartFM.destroy();

// Vider le tableau (ID correct: table-fm-body)
const tbody = document.getElementById('table-fm-body');
if (tbody) {
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--orange); font-style: italic;">⚠️ Aucune donnée disponible</td></tr>';
}

// Réinitialiser le commentaire pour la structure courante
initSectionMDE('fm-commentaire', structureId, annee, 'Frais_Mission');

return;
  }
  
  // Périmètre et moyennes
  const perimetre = getPerimetreFraisMission(structureId);
  const libellePerimetre = getLibellePerimetreFraisMission(perimetre);
  const moyennesPerimetre = getFraisMissionMoyennes(perimetre, anneeCourante);
  const moyennesNational = getFraisMissionMoyennes('National', anneeCourante);
  
  
  // ═══════════════════════════════════════════════════════════════
  // KPI PILLS
  // ═══════════════════════════════════════════════════════════════
  
  // Total Frais Mission
  document.getElementById('fm-total-value').textContent = formatNumber(dataCourante.montant_total / 1000, 0) + ' K€';
  
  if (dataPrecedente && dataPrecedente.montant_total > 0) {
const evolPct = ((dataCourante.montant_total - dataPrecedente.montant_total) / dataPrecedente.montant_total * 100);
const badge = document.getElementById('fm-total-evol');
badge.className = 'fm-evolution-badge ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  if (moyennesPerimetre && moyennesNational) {
const ecartPerimetre = moyennesPerimetre.moy_frais_par_agent > 0
  ? ((dataCourante.frais_par_agent - moyennesPerimetre.moy_frais_par_agent) / moyennesPerimetre.moy_frais_par_agent * 100)
  : 0;
const ecartNational = moyennesNational.moy_frais_par_agent > 0
  ? ((dataCourante.frais_par_agent - moyennesNational.moy_frais_par_agent) / moyennesNational.moy_frais_par_agent * 100)
  : 0;

document.getElementById('fm-total-comp').innerHTML = `
  <div style="display:flex;justify-content:space-between;margin-top:3px;">
    <span>vs ${libellePerimetre}</span>
    <span style="font-weight:500;">${ecartPerimetre >= 0 ? '+' : ''}${ecartPerimetre.toFixed(1)}%</span>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:3px;">
    <span>vs National</span>
    <span style="font-weight:500;">${ecartNational >= 0 ? '+' : ''}${ecartNational.toFixed(1)}%</span>
  </div>
`;
  } else {
document.getElementById('fm-total-comp').innerHTML = '';
  }
  
  // Formation
  document.getElementById('fm-formation-value').textContent = formatNumber(dataCourante.total_formation / 1000, 0) + ' K€';
  
  if (dataPrecedente && dataPrecedente.total_formation > 0) {
const evolPct = ((dataCourante.total_formation - dataPrecedente.total_formation) / dataPrecedente.total_formation * 100);
const badge = document.getElementById('fm-formation-evol');
badge.className = 'fm-evolution-badge ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  document.getElementById('fm-formation-pct').textContent = `${dataCourante.pct_formation.toFixed(1)}% du total`;
  
  // Autres missions
  document.getElementById('fm-autres-value').textContent = formatNumber(dataCourante.total_autres / 1000, 0) + ' K€';
  
  if (dataPrecedente && dataPrecedente.total_autres > 0) {
const evolPct = ((dataCourante.total_autres - dataPrecedente.total_autres) / dataPrecedente.total_autres * 100);
const badge = document.getElementById('fm-autres-evol');
badge.className = 'fm-evolution-badge ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  document.getElementById('fm-autres-pct').textContent = `${dataCourante.pct_autres.toFixed(1)}% du total`;
  
  // Coût moyen par agent
  document.getElementById('fm-agent-value').textContent = formatCurrency(dataCourante.frais_par_agent);
  
  if (dataPrecedente && dataPrecedente.frais_par_agent > 0) {
const evolPct = ((dataCourante.frais_par_agent - dataPrecedente.frais_par_agent) / dataPrecedente.frais_par_agent * 100);
const badge = document.getElementById('fm-agent-evol');
badge.className = 'fm-evolution-badge ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  if (moyennesPerimetre && moyennesNational) {
const ecartPerimetre = moyennesPerimetre.moy_frais_par_agent > 0
  ? ((dataCourante.frais_par_agent - moyennesPerimetre.moy_frais_par_agent) / moyennesPerimetre.moy_frais_par_agent * 100)
  : 0;
const ecartNational = moyennesNational.moy_frais_par_agent > 0
  ? ((dataCourante.frais_par_agent - moyennesNational.moy_frais_par_agent) / moyennesNational.moy_frais_par_agent * 100)
  : 0;

document.getElementById('fm-agent-comp').innerHTML = `
  <div style="display:flex;justify-content:space-between;margin-top:3px;">
    <span>vs ${libellePerimetre}</span>
    <span style="font-weight:500;">${ecartPerimetre >= 0 ? '+' : ''}${ecartPerimetre.toFixed(1)}%</span>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:3px;">
    <span>vs National</span>
    <span style="font-weight:500;">${ecartNational >= 0 ? '+' : ''}${ecartNational.toFixed(1)}%</span>
  </div>
`;
  } else {
document.getElementById('fm-agent-comp').innerHTML = '';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // GRAPHIQUE RÉPARTITION
  // ═══════════════════════════════════════════════════════════════
  
  const annees = [anneeCourante - 3, anneeCourante - 2, anneeCourante - 1, anneeCourante];
  const dataMultiAnnees = getFraisMissionMultiAnnees(structureId, annees);
  
  const totaux = dataMultiAnnees.map(d => d.montant_total || 0);
  const transport = dataMultiAnnees.map(d => d.total_transport || 0);
  const hebergement = dataMultiAnnees.map(d => d.total_hebergement || 0);
  const repas = dataMultiAnnees.map(d => d.total_repas || 0);
  
  const transportPct = transport.map((v, i) => totaux[i] > 0 ? (v / totaux[i] * 100).toFixed(1) : 0);
  const hebergementPct = hebergement.map((v, i) => totaux[i] > 0 ? (v / totaux[i] * 100).toFixed(1) : 0);
  const repasPct = repas.map((v, i) => totaux[i] > 0 ? (v / totaux[i] * 100).toFixed(1) : 0);
  
  createFraisMissionRepartitionChart(annees, transportPct, hebergementPct, repasPct, transport, hebergement, repas);
  
  // ═══════════════════════════════════════════════════════════════
  // TABLEAU DÉTAILLÉ
  // ═══════════════════════════════════════════════════════════════
  
  const tbody = document.getElementById('table-fm-body');
  tbody.innerHTML = '';
  
  annees.forEach((annee, idx) => {
const data = dataMultiAnnees[idx];

// Ligne année (totaux)
const rowAnnee = tbody.insertRow();
rowAnnee.style.background = '#F1EFE8';
rowAnnee.style.fontWeight = '500';
rowAnnee.innerHTML = `
  <td style="padding:12px 16px;">${annee}</td>
  <td style="padding:12px 16px;text-align:right;">${formatNumber(data.total_transport / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;">${formatNumber(data.total_hebergement / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;">${formatNumber(data.total_repas / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-weight:500;">${formatNumber(data.montant_total / 1000, 0)} K€</td>
`;

// Ligne Formation
const rowFormation = tbody.insertRow();
rowFormation.style.background = 'rgba(241, 239, 232, 0.4)';
rowFormation.innerHTML = `
  <td style="padding:12px 16px 12px 32px;font-size:13px;">Formation</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.formation_transport / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.formation_hebergement / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.formation_repas / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.total_formation / 1000, 0)} K€</td>
`;

// Ligne Autres missions
const rowAutres = tbody.insertRow();
rowAutres.style.background = 'rgba(241, 239, 232, 0.4)';
rowAutres.innerHTML = `
  <td style="padding:12px 16px 12px 32px;font-size:13px;">Autres missions</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.autres_transport / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.autres_hebergement / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.autres_repas / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(data.total_autres / 1000, 0)} K€</td>
`;
  });
  
  // Charger le commentaire Frais de Mission
  initSectionMDE('fm-commentaire', structureId, annee, 'Frais_Mission');
}

function createFraisMissionRepartitionChart(annees, transportPct, hebergementPct, repasPct, transportMontants, hebergementMontants, repasMontants) {
  const canvas = document.getElementById('chart-fm-repartition');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Détruire graphique existant
  if (window.chartFMRepartition) {
window.chartFMRepartition.destroy();
  }
  
  window.chartFMRepartition = new Chart(ctx, {
type: 'bar',
data: {
  labels: annees.map(a => String(a)),
  datasets: [
    {
      label: 'Transport',
      data: transportPct,
      backgroundColor: '#A8CEF0',
      borderColor: 'transparent',
      borderWidth: 0
    },
    {
      label: 'Hébergement',
      data: hebergementPct,
      backgroundColor: '#A3DCC5',
      borderColor: 'transparent',
      borderWidth: 0
    },
    {
      label: 'Repas',
      data: repasPct,
      backgroundColor: '#F5D6A8',
      borderColor: 'transparent',
      borderWidth: 0
    }
  ]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const datasetLabel = context.dataset.label;
          const percentage = context.parsed.y;
          const yearIndex = context.dataIndex;
          let montant;
          if (datasetLabel === 'Transport') montant = transportMontants[yearIndex];
          else if (datasetLabel === 'Hébergement') montant = hebergementMontants[yearIndex];
          else montant = repasMontants[yearIndex];
          return datasetLabel + ': ' + percentage + '% (' + formatCurrency(montant / 1000, 0) + ' K€)';
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 12 } }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      max: 100,
      ticks: {
        font: { size: 12 },
        callback: function(value) {
          return value + '%';
        }
      },
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    }
  }
}
  });
}

function refreshInformatique(structureId, annee) {
  const anneeCourante = annee;
  const anneePrecedente = annee - 1;
  
  const dataCourante = getInformatiqueData(structureId, anneeCourante);
  const dataPrecedente = getInformatiqueData(structureId, anneePrecedente);
  
  if (!dataCourante) {

// Vider tous les KPIs avec les bons IDs
document.getElementById('it-total').textContent = '—';
document.getElementById('it-total-evol').className = 'it-evolution';
document.getElementById('it-total-evol').innerHTML = '—';
document.getElementById('it-pct-portables').textContent = '';

document.getElementById('it-ratio').textContent = '—';
document.getElementById('it-ratio-evol').className = 'it-evolution';
document.getElementById('it-ratio-evol').innerHTML = '—';
document.getElementById('it-ratio-comp').innerHTML = '';

document.getElementById('it-budget-annuel').textContent = '—';
document.getElementById('it-budget-annuel-evol').className = 'it-evolution';
document.getElementById('it-budget-annuel-evol').innerHTML = '—';

document.getElementById('it-budget-moyen').textContent = '—';

document.getElementById('it-budget-agent-annuel').textContent = '—';
document.getElementById('it-budget-agent-annuel-evol').className = 'it-evolution';
document.getElementById('it-budget-agent-annuel-evol').innerHTML = '—';
document.getElementById('it-budget-agent-annuel-comp').innerHTML = '';

document.getElementById('it-budget-agent-moyen').textContent = '—';
document.getElementById('it-budget-agent-moyen-comp').innerHTML = '';

// Détruire le graphique
const chartIT = Chart.getChart('chart-it-type');
if (chartIT) chartIT.destroy();

// Vider le tableau
const tbody = document.getElementById('table-it-body');
if (tbody) {
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--orange); font-style: italic;">⚠️ Aucune donnée disponible</td></tr>';
}

// Réinitialiser le commentaire pour la structure courante
initSectionMDE('it-commentaire', structureId, annee, 'Informatique');

return;
  }
  
  // Périmètre et moyennes
  const perimetre = getPerimetreInformatique(structureId);
  const libellePerimetre = getLibellePerimetreInformatique(perimetre);
  const moyennesPerimetre = getInformatiqueMoyennes(perimetre, anneeCourante);
  const moyennesNational = getInformatiqueMoyennes('National', anneeCourante);
  
  // Labels année
  document.getElementById('it-annee-label').textContent = anneeCourante;
  document.getElementById('it-annee-label2').textContent = anneeCourante;
  const immoLabel = document.getElementById('immo-annee-label');
  if (immoLabel) immoLabel.textContent = anneeCourante;
  
  // ═══════════════════════════════════════════════════════════════
  // KPI 1 : Total Postes
  // ═══════════════════════════════════════════════════════════════
  
  document.getElementById('it-total').textContent = formatNumber(dataCourante.nb_postes_travail);
  
  if (dataPrecedente && dataPrecedente.nb_postes_travail > 0) {
const evolPct = ((dataCourante.nb_postes_travail - dataPrecedente.nb_postes_travail) / dataPrecedente.nb_postes_travail * 100);
const badge = document.getElementById('it-total-evol');
badge.className = 'it-evolution ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  document.getElementById('it-pct-portables').textContent = `${dataCourante.pct_portables.toFixed(0)}% de portables`;
  
  // ═══════════════════════════════════════════════════════════════
  // KPI 2 : Ratio Poste/Agent
  // ═══════════════════════════════════════════════════════════════
  
  document.getElementById('it-ratio').textContent = formatNumber(dataCourante.ratio_poste_agent, 2);
  
  if (dataPrecedente && dataPrecedente.ratio_poste_agent > 0) {
const evolPct = ((dataCourante.ratio_poste_agent - dataPrecedente.ratio_poste_agent) / dataPrecedente.ratio_poste_agent * 100);
const badge = document.getElementById('it-ratio-evol');
badge.className = 'it-evolution ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  if (moyennesPerimetre && moyennesNational) {
const ecartPerimetre = moyennesPerimetre.moy_ratio_poste_agent > 0
  ? ((dataCourante.ratio_poste_agent - moyennesPerimetre.moy_ratio_poste_agent) / moyennesPerimetre.moy_ratio_poste_agent * 100)
  : 0;
const ecartNational = moyennesNational.moy_ratio_poste_agent > 0
  ? ((dataCourante.ratio_poste_agent - moyennesNational.moy_ratio_poste_agent) / moyennesNational.moy_ratio_poste_agent * 100)
  : 0;

document.getElementById('it-ratio-comp').innerHTML = `
  <div style="display:flex;justify-content:space-between;margin-top:3px;opacity:0.6;">
    <span>vs ${libellePerimetre}</span>
    <span style="font-weight:500;">${ecartPerimetre >= 0 ? '+' : ''}${ecartPerimetre.toFixed(1)}%</span>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:3px;opacity:0.6;">
    <span>vs National</span>
    <span style="font-weight:500;">${ecartNational >= 0 ? '+' : ''}${ecartNational.toFixed(1)}%</span>
  </div>
`;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // KPI 3 : Budget IT annuel
  // ═══════════════════════════════════════════════════════════════
  
  document.getElementById('it-budget-annuel').textContent = formatNumber(dataCourante.budget_it / 1000, 0) + ' K€';
  
  if (dataPrecedente && dataPrecedente.budget_it > 0) {
const evolPct = ((dataCourante.budget_it - dataPrecedente.budget_it) / dataPrecedente.budget_it * 100);
const badge = document.getElementById('it-budget-annuel-evol');
badge.className = 'it-evolution ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // KPI 4 : Budget IT Moyen 4 ans
  // ═══════════════════════════════════════════════════════════════
  
  const annees4 = [anneeCourante, anneeCourante - 1, anneeCourante - 2, anneeCourante - 3];
  document.getElementById('it-badge-4ans').textContent = `Lissé ${annees4[3]}-${annees4[0]}`;
  document.getElementById('it-budget-moyen').textContent = formatNumber(dataCourante.budget_it_moyen_4ans / 1000, 0) + ' K€';
  
  // ═══════════════════════════════════════════════════════════════
  // KPI 5 : Budget IT par Agent annuel
  // ═══════════════════════════════════════════════════════════════
  
  document.getElementById('it-budget-agent-annuel').textContent = formatCurrency(dataCourante.budget_it_par_agent);
  
  if (dataPrecedente && dataPrecedente.budget_it_par_agent > 0) {
const evolPct = ((dataCourante.budget_it_par_agent - dataPrecedente.budget_it_par_agent) / dataPrecedente.budget_it_par_agent * 100);
const badge = document.getElementById('it-budget-agent-annuel-evol');
badge.className = 'it-evolution ' + (evolPct >= 0 ? 'positive' : 'negative');
badge.innerHTML = `<span>${evolPct >= 0 ? '↗' : '↘'}</span><span>${evolPct >= 0 ? '+' : ''}${evolPct.toFixed(1)}% vs ${anneePrecedente}</span>`;
  }
  
  if (moyennesPerimetre && moyennesNational) {
const ecartPerimetre = moyennesPerimetre.moy_budget_it_par_agent > 0
  ? ((dataCourante.budget_it_par_agent - moyennesPerimetre.moy_budget_it_par_agent) / moyennesPerimetre.moy_budget_it_par_agent * 100)
  : 0;
const ecartNational = moyennesNational.moy_budget_it_par_agent > 0
  ? ((dataCourante.budget_it_par_agent - moyennesNational.moy_budget_it_par_agent) / moyennesNational.moy_budget_it_par_agent * 100)
  : 0;

document.getElementById('it-budget-agent-annuel-comp').innerHTML = `
  <div style="display:flex;justify-content:space-between;margin-top:3px;opacity:0.6;">
    <span>vs ${libellePerimetre}</span>
    <span style="font-weight:500;">${ecartPerimetre >= 0 ? '+' : ''}${ecartPerimetre.toFixed(1)}%</span>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:3px;opacity:0.6;">
    <span>vs National</span>
    <span style="font-weight:500;">${ecartNational >= 0 ? '+' : ''}${ecartNational.toFixed(1)}%</span>
  </div>
`;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // KPI 6 : Budget IT Moyen par Agent 4 ans
  // ═══════════════════════════════════════════════════════════════
  
  document.getElementById('it-badge-4ans2').textContent = `Lissé ${annees4[3]}-${annees4[0]}`;
  document.getElementById('it-budget-agent-moyen').textContent = formatCurrency(dataCourante.budget_it_moyen_par_agent_4ans);
  
  if (moyennesPerimetre && moyennesNational) {
const ecartPerimetre = moyennesPerimetre.moy_budget_it_moyen_par_agent_4ans > 0
  ? ((dataCourante.budget_it_moyen_par_agent_4ans - moyennesPerimetre.moy_budget_it_moyen_par_agent_4ans) / moyennesPerimetre.moy_budget_it_moyen_par_agent_4ans * 100)
  : 0;
const ecartNational = moyennesNational.moy_budget_it_moyen_par_agent_4ans > 0
  ? ((dataCourante.budget_it_moyen_par_agent_4ans - moyennesNational.moy_budget_it_moyen_par_agent_4ans) / moyennesNational.moy_budget_it_moyen_par_agent_4ans * 100)
  : 0;

document.getElementById('it-budget-agent-moyen-comp').innerHTML = `
  <div style="display:flex;justify-content:space-between;margin-top:3px;opacity:0.8;">
    <span>vs ${libellePerimetre}</span>
    <span style="font-weight:500;">${ecartPerimetre >= 0 ? '+' : ''}${ecartPerimetre.toFixed(1)}%</span>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:3px;opacity:0.8;">
    <span>vs National</span>
    <span style="font-weight:500;">${ecartNational >= 0 ? '+' : ''}${ecartNational.toFixed(1)}%</span>
  </div>
`;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // GRAPHIQUE
  // ═══════════════════════════════════════════════════════════════
  
  const dataMultiAnnees = getInformatiqueMultiAnnees(structureId, annees4);
  
  const portables = dataMultiAnnees.map(d => d.nb_portables || 0);
  const fixes = dataMultiAnnees.map(d => d.nb_fixes || 0);
  
  createInformatiqueChart(annees4, portables, fixes);
  
  // ═══════════════════════════════════════════════════════════════
  // TABLEAU
  // ═══════════════════════════════════════════════════════════════
  
  const tbody = document.getElementById('table-it-body');
  tbody.innerHTML = '';
  
  let somme_budget = 0;
  let somme_budget_agent = 0;
  let nb_annees = 0;
  
  dataMultiAnnees.forEach((data, idx) => {
const row = tbody.insertRow();
if (idx === dataMultiAnnees.length - 1) {
  row.style.background = '#F1EFE8';
  row.style.fontWeight = '500';
}

const hasInventaire = data.nb_postes_travail > 0;

row.innerHTML = `
  <td style="padding:12px 16px;">${data.annee}</td>
  <td style="padding:12px 16px;text-align:right;">${hasInventaire ? formatNumber(data.nb_portables) : '—'}</td>
  <td style="padding:12px 16px;text-align:right;">${hasInventaire ? formatNumber(data.nb_fixes) : '—'}</td>
  <td style="padding:12px 16px;text-align:right;">${hasInventaire ? formatNumber(data.nb_postes_travail) : '—'}</td>
  <td style="padding:12px 16px;text-align:right;">${hasInventaire ? formatNumber(data.ratio_poste_agent, 2) : '—'}</td>
  <td style="padding:12px 16px;text-align:right;">${formatNumber(data.budget_it / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;">${data.budget_it_par_agent > 0 ? formatCurrency(data.budget_it_par_agent) : '—'}</td>
`;

if (data.budget_it > 0) {
  somme_budget += data.budget_it;
  somme_budget_agent += data.budget_it_par_agent;
  nb_annees++;
}
  });
  
  // Ligne moyenne
  if (nb_annees > 0) {
const rowMoyenne = tbody.insertRow();
rowMoyenne.style.background = '#E8F7F2';
rowMoyenne.style.fontWeight = '500';
rowMoyenne.style.borderTop = '2px solid #1D9E75';

const moy_budget = somme_budget / nb_annees;
const moy_budget_agent = somme_budget_agent / nb_annees;

rowMoyenne.innerHTML = `
  <td colspan="5" style="padding:12px 16px;color:#085041;">Moyenne ${annees4[3]}-${annees4[0]} (lissée)</td>
  <td style="padding:12px 16px;text-align:right;color:#04342C;">${formatNumber(moy_budget / 1000, 0)} K€</td>
  <td style="padding:12px 16px;text-align:right;color:#04342C;">${formatCurrency(moy_budget_agent)}</td>
`;
  }
  
  // Charger le commentaire Informatique
  initSectionMDE('it-commentaire', structureId, annee, 'Informatique');
}

function createInformatiqueChart(annees, portables, fixes) {
  const canvas = document.getElementById('chart-it-type');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (window.chartITType) {
window.chartITType.destroy();
  }
  
  window.chartITType = new Chart(ctx, {
type: 'bar',
data: {
  labels: annees.map(a => String(a)),
  datasets: [
    {
      label: 'Portables',
      data: portables,
      backgroundColor: '#7F77DD',
      borderColor: 'transparent',
      borderWidth: 0
    },
    {
      label: 'Fixes',
      data: fixes,
      backgroundColor: '#D3D1C7',
      borderColor: 'transparent',
      borderWidth: 0
    }
  ]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.dataset.label + ': ' + context.parsed.y + ' postes';
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 12 } }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        font: { size: 12 },
        callback: function(value) {
          return value;
        }
      },
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    }
  }
}
  });
}


/**
 * Fonction principale d'export PDF - affiche le menu popup
 */
function exportToPDF() {
  showExportModal();
}

/**
 * Affiche le menu modal d'export avec options
 */
function showExportModal() {
  const modal = document.createElement('div');
  modal.id = 'export-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Marianne', sans-serif;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 0;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  `;
  
  modalContent.innerHTML = `
    <div style="background: linear-gradient(135deg, #002F6C, #1351A8); padding: 24px; color: white;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Exporter en PDF</h2>
      <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Configurez les paramètres d'export</p>
    </div>
    
    <div style="padding: 24px;">
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-weight: 600; color: #1E2D3D; margin-bottom: 12px; font-size: 14px;">📄 Mode d'export</label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #E6ECF8; border-radius: 8px; cursor: pointer; transition: all 0.2s;" class="export-option" data-mode="single">
            <input type="radio" name="export-mode" value="single" checked style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
            <div>
              <div style="font-weight: 600; color: #002F6C; font-size: 14px;">Structure actuelle</div>
              <div style="font-size: 12px; color: #6c757d; margin-top: 2px;">Exporter uniquement <strong id="current-structure-name"></strong></div>
            </div>
          </label>
          
          <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #E6ECF8; border-radius: 8px; cursor: pointer; transition: all 0.2s;" class="export-option" data-mode="multiple">
            <input type="radio" name="export-mode" value="multiple" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
            <div>
              <div style="font-weight: 600; color: #002F6C; font-size: 14px;">Toutes les structures</div>
              <div style="font-size: 12px; color: #6c757d; margin-top: 2px;">Générer un PDF unique avec toutes les structures</div>
            </div>
          </label>
          
          <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #E6ECF8; border-radius: 8px; cursor: pointer; transition: all 0.2s;" class="export-option" data-mode="zip">
            <input type="radio" name="export-mode" value="zip" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
            <div>
              <div style="font-weight: 600; color: #002F6C; font-size: 14px;">Archive ZIP</div>
              <div style="font-size: 12px; color: #6c757d; margin-top: 2px;">Générer un PDF par structure dans une archive ZIP</div>
            </div>
          </label>
        </div>
      </div>
      
      <div id="filter-section" style="margin-bottom: 24px; display: none;">
        <label style="display: block; font-weight: 600; color: #1E2D3D; margin-bottom: 12px; font-size: 14px;">🔍 Filtrer les structures</label>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <label style="display: flex; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="filter-type" value="DG" style="margin-right: 8px;">
            <span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; margin-right: 6px;">DG</span>
            Direction Générale
          </label>
          <label style="display: flex; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" checked class="filter-type" value="DI" style="margin-right: 8px;">
            <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; margin-right: 6px;">DI</span>
            Directions Interrégionales (Métropole)
          </label>
          <label style="display: flex; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="filter-type" value="DI Outremer" style="margin-right: 8px;">
            <span style="background: #17a2b8; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; margin-right: 6px;">DI OM</span>
            Directions Interrégionales Outremer
          </label>
          <label style="display: flex; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="filter-type" value="DR Metropole" style="margin-right: 8px;">
            <span style="background: #9b59b6; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; margin-right: 6px;">DR</span>
            Directions Régionales (Métropole)
          </label>
          <label style="display: flex; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" checked class="filter-type" value="DR Outremer" style="margin-right: 8px;">
            <span style="background: #6f42c1; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; margin-right: 6px;">DR OM</span>
            Directions Régionales Outremer
          </label>
          <label style="display: flex; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="filter-type" value="SCN" style="margin-right: 8px;">
            <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; margin-right: 6px;">SCN</span>
            Service Commun National
          </label>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button id="btn-cancel-export" style="flex: 1; padding: 12px; border: 2px solid #dee2e6; background: white; color: #495057; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Marianne', sans-serif; transition: all 0.2s;">Annuler</button>
        <button id="btn-confirm-export" style="flex: 2; padding: 12px; border: none; background: linear-gradient(135deg, #002F6C, #1351A8); color: white; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Marianne', sans-serif; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 47, 108, 0.3);">🎯 Générer le PDF</button>
      </div>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  document.getElementById('current-structure-name').textContent = FICHE_STATE.structure.sigle;
  
  const options = modalContent.querySelectorAll('.export-option');
  options.forEach(option => {
    option.addEventListener('click', function() {
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
      
      options.forEach(opt => {
        opt.style.border = '2px solid #E6ECF8';
        opt.style.background = 'white';
      });
      this.style.border = '2px solid #002F6C';
      this.style.background = '#F0F4FF';
      
      const mode = radio.value;
      const filterSection = document.getElementById('filter-section');
      if (mode === 'multiple' || mode === 'zip') {
        filterSection.style.display = 'block';
      } else {
        filterSection.style.display = 'none';
      }
    });
  });
  
  document.getElementById('btn-cancel-export').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.getElementById('btn-confirm-export').addEventListener('click', async () => {
    const mode = document.querySelector('input[name="export-mode"]:checked').value;
    
    let filters = null;
    if (mode === 'multiple' || mode === 'zip') {
      const checkedTypes = Array.from(document.querySelectorAll('.filter-type:checked')).map(cb => cb.value);
      filters = { types: checkedTypes };
    }
    
    document.body.removeChild(modal);
    await executeExport(mode, filters);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

async function executeExport(mode, filters) {
  if (mode === 'single') {
    await exportSingleStructurePDF(FICHE_STATE.structure, FICHE_STATE.annee);
  } else if (mode === 'multiple') {
    await exportAllStructuresInOnePDF(filters);
  } else if (mode === 'zip') {
    await exportAllStructuresAsZIP(filters);
  }
}


function getPDFTimestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const d = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const h = `${pad(now.getHours())}h${pad(now.getMinutes())}`;
  return `${d}-${h}`;
}
async function exportSingleStructurePDF(struct, annee) {
  const { jsPDF } = window.jspdf;
  const loadingDiv = showLoadingMessage(`Génération du PDF pour ${struct.sigle}...`);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    await addStructureToPDF(pdf, struct, annee, true);
    pdf.save(`${struct.sigle}-${annee}-${getPDFTimestamp()}.pdf`);
    hideLoadingMessage(loadingDiv);
  } catch (error) {
    hideLoadingMessage(loadingDiv);
    alert('Erreur PDF: ' + (error && error.message ? error.message : String(error)));
    console.error('PDF export error:', error);
  }
}

async function exportAllStructuresInOnePDF(filters) {
  const { jsPDF } = window.jspdf;
  const annee = FICHE_STATE.annee;
  
  // Utiliser getStructuresArray() pour avoir un tableau d'objets
  let structures = getStructuresArray();
  
  // Appliquer les filtres si spécifiés
  if (filters && filters.types && filters.types.length > 0) {
    structures = filterStructuresByTypes(structures, filters.types);
  }
  
  const loadingDiv = showLoadingMessage(`Génération d'un PDF avec ${structures.length} structures...`);
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let isFirstPage = true;
    
    for (let i = 0; i < structures.length; i++) {
      const struct = structures[i];
      loadingDiv.querySelector('div:last-child').textContent = `Structure ${i + 1}/${structures.length} : ${struct.sigle}`;
      
      await selectStructure(struct.id);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!isFirstPage) pdf.addPage();
      await addStructureToPDF(pdf, struct, annee, isFirstPage);
      isFirstPage = false;
    }
    
    pdf.save(`toutes-structures-${annee}-${getPDFTimestamp()}.pdf`);
    hideLoadingMessage(loadingDiv);
    alert(`PDF généré avec succès avec ${structures.length} structures !`);
  } catch (error) {
    hideLoadingMessage(loadingDiv);
    alert('Erreur lors de la génération du PDF.');
  }
}

async function exportAllStructuresAsZIP(filters) {
  if (typeof JSZip === 'undefined') {
    alert('La génération d\'archive ZIP nécessite la bibliothèque JSZip.');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const annee = FICHE_STATE.annee;
  
  // Utiliser getStructuresArray() pour avoir un tableau d'objets
  let structures = getStructuresArray();
  
  // Appliquer les filtres si spécifiés
  if (filters && filters.types && filters.types.length > 0) {
    structures = filterStructuresByTypes(structures, filters.types);
  }
  
  const loadingDiv = showLoadingMessage(`Génération de ${structures.length} PDF...`);
  
  try {
    const zip = new JSZip();
    
    for (let i = 0; i < structures.length; i++) {
      const struct = structures[i];
      loadingDiv.querySelector('div:last-child').textContent = `PDF ${i + 1}/${structures.length} : ${struct.sigle}`;
      
      await selectStructure(struct.id);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      await addStructureToPDF(pdf, struct, annee, true);
      
      const pdfBlob = pdf.output('blob');
      zip.file(`${struct.sigle}-${annee}-${getPDFTimestamp()}.pdf`, pdfBlob);
    }
    
    loadingDiv.querySelector('div:last-child').textContent = 'Compression de l\'archive...';
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiches-identite-${annee}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    hideLoadingMessage(loadingDiv);
    alert(`Archive ZIP générée avec succès avec ${structures.length} PDF !`);
  } catch (error) {
    hideLoadingMessage(loadingDiv);
    alert('Erreur lors de la génération de l\'archive ZIP.');
  }
}

/**
 * Rendu natif jsPDF d'un texte Markdown.
 * Gère : titres ##/###, **gras**, *italique*, listes - / *, retours à la ligne.
 *
 * @param {object} ctx   Objet contexte partagé avec le scope appelant : { y, addPage }
 *                       ctx.y est lu ET mis à jour directement (passage par référence objet).
 *                       ctx.addPage() doit effectuer le saut de page et mettre ctx.y à jour.
 */
// ═══════════════════════════════════════════════════════════════
// IMMOBILIER
// ═══════════════════════════════════════════════════════════════

/**
 * Retourne les sites immobiliers d'une structure, séparés public/privé
 */
function getImmobilierSites(structureId) {
  const immo = FICHE_STATE.data.immobilier;
  if (!immo || !immo.id) return { public: [], prive: [] };

  const annee = FICHE_STATE.annee;
  const colEnergie = `Energie_${annee}`;
  const colCout    = `Cout_Surfacique_${annee}`;

  // Pour une DI, inclure les DR rattachées (ex: DI 972 → DR 971/972/973)
  const currentStruct = FICHE_STATE.data.structures;
  const structIdx = currentStruct ? currentStruct.id.indexOf(structureId) : -1;
  let structureIds = [structureId];
  if (structIdx !== -1 && currentStruct.Type[structIdx] === 'DI') {
    structureIds = structureIds.concat(getDRRattachees(structureId));
  }

  const sites = [];
  const seenSite = new Set();
  for (let i = 0; i < immo.id.length; i++) {
    if (!structureIds.includes(immo.Structure[i])) continue;
    const siteKey = immo.site?.[i] || immo.Libelle?.[i] || String(immo.id[i]);
    if (seenSite.has(siteKey)) continue;
    seenSite.add(siteKey);
    sites.push({
      libelle:        immo.Libelle?.[i]        || '—',
      ville:          immo.Ville?.[i]           || '—',
      type_bien:      immo.Type_Bien?.[i]       || '—',
      statut:         immo.Statut?.[i]          || '—',
      sub:            immo.SUB?.[i]             || 0,
      residents:      immo.Residents?.[i]       || 0,
      ratio_occ:      immo.Ratio_Occupation?.[i]|| null,
      energie:        immo[colEnergie]?.[i]     || 0,
      cout_surf:      immo[colCout]?.[i]        || null,
      bailleur:       immo.Bailleur?.[i]        || '—',
      date_fin_bail:  immo.Date_Fin_Bail?.[i]   || null,
      loyer_annuel:   immo.Loyer_Annuel?.[i]    || 0,
      ratio_loyer:    immo.Ratio_Loyer_SUB?.[i] || null,
    });
  }

  sites.sort((a, b) => a.ville.localeCompare(b.ville) || a.libelle.localeCompare(b.libelle));

  return {
    public: sites.filter(s => !s.statut.includes('Prise à bail')),
    prive:  sites.filter(s => s.statut.includes('Prise à bail')),
  };
}

/**
 * Retourne le coût surfacique pour les 4 années disponibles (sparkline)
 */
function getImmobilierHistorique(structureId) {
  const consolStruct = FICHE_STATE.data.consolidation_structure;
  if (!consolStruct || !consolStruct.Structure) return [];

  const annees = [2022, 2023, 2024, 2025];

  // Pour DI sans ligne propre (ex: DI 972), agréger depuis les DR rattachées
  const drIds = getDRRattachees(structureId);
  const useDRFallback = drIds.length > 0;

  return annees.map(a => {
    // Chercher ligne directe
    for (let i = 0; i < consolStruct.Structure.length; i++) {
      if (consolStruct.Structure[i] === structureId && consolStruct.Annee[i] === a) {
        const cout = consolStruct.Cout_Surfacique?.[i] || null;
        const energie = consolStruct.Charges_Energie?.[i] || 0;
        const sub = consolStruct.SUB_Total?.[i] || 0;
        // Considérer valide si SUB_Total renseigné
        if (sub > 0 || cout != null) {
          return { annee: a, cout_surfacique: cout, charges_energie: energie };
        }
      }
    }
    // Fallback : agréger DR rattachées
    if (useDRFallback) {
      let totalSub = 0, totalEnergie = 0;
      for (const drId of drIds) {
        for (let i = 0; i < consolStruct.Structure.length; i++) {
          if (consolStruct.Structure[i] === drId && consolStruct.Annee[i] === a) {
            totalSub     += consolStruct.SUB_Total?.[i] || 0;
            totalEnergie += consolStruct.Charges_Energie?.[i] || 0;
          }
        }
      }
      return {
        annee: a,
        cout_surfacique: totalSub > 0 ? totalEnergie / totalSub : null,
        charges_energie: totalEnergie,
      };
    }
    return { annee: a, cout_surfacique: null, charges_energie: 0 };
  });
}

/**
 * Rafraîchit la section Immobilier
 */
function refreshImmobilier(structureId, annee) {
  // Récupération KPI : fallback agrégation DR rattachées pour DI sans ligne propre (ex: DI 972)
  let data    = getConsolidationStructureData(structureId, annee);
  let dataN1  = getConsolidationStructureData(structureId, annee - 1);
  const perimetre = getPerimetreStructure(structureId);
  const consol    = getConsolidationData(perimetre, annee);

  // Fallback DI 972 : agréger SUB/residents/energie depuis les DR rattachées
  if (!data || (data.sub_total === 0 && data.residents_total === 0)) {
    const drIds = getDRRattachees(structureId);
    if (drIds.length > 0) {
      function agregImmo(ids, an) {
        let sub = 0, res = 0, energie = 0, nbSites = 0;
        for (const drId of ids) {
          const d = getConsolidationStructureData(drId, an);
          if (!d) continue;
          sub     += d.sub_total || 0;
          res     += d.residents_total || 0;
          energie += d.charges_energie || 0;
          nbSites += d.nb_sites || 0;
        }
        if (sub === 0 && res === 0) return null;
        return {
          sub_total:       sub,
          residents_total: res,
          charges_energie: energie,
          nb_sites:        nbSites,
          ratio_occupation: res > 0 ? sub / res : null,
          cout_surfacique:  sub > 0 ? energie / sub : null,
        };
      }
      data   = agregImmo(drIds, annee)   || data;
      dataN1 = agregImmo(drIds, annee - 1) || dataN1;
    }
  }

  // ── KPI pills ──────────────────────────────────────────────────
  const el = (id) => document.getElementById(id);

  // Pill 1 : SUB + nb sites fusionnés
  const subTotal = data?.sub_total || 0;
  el('immo-sub-value').textContent  = subTotal > 0 ? formatNumber(subTotal, 0) + ' m²' : '—';
  el('immo-sites-detail').textContent = data?.nb_sites > 0 ? data.nb_sites + ' site' + (data.nb_sites > 1 ? 's' : '') : '';

  // Pill 2 : Ratio occupation — comparaison périmètre uniquement
  const ratio = data?.ratio_occupation;
  el('immo-ratio-value').textContent = ratio != null ? formatNumber(ratio, 1) + ' m²/rés.' : '—';
  // Résidents total sous la valeur
  const resEl = el('immo-ratio-residents');
  if (resEl) resEl.textContent = data?.residents_total > 0 ? formatNumber(data.residents_total, 0) + ' résidents' : '';
  if (consol?.moy_ratio_occupation && ratio != null) {
    const ecart    = ratio - consol.moy_ratio_occupation;
    const ecartPct = (ecart / consol.moy_ratio_occupation) * 100;
    el('immo-ratio-comp').innerHTML = `<span style="color:var(--gris2);">${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs moy. ${perimetre}</span>`;
  } else {
    el('immo-ratio-comp').textContent = '';
  }

  // Pill 3 : Coût surfacique + évolution fusionnés
  const coutN  = data?.cout_surfacique;
  const coutN1 = dataN1?.cout_surfacique;
  el('immo-cout-value').textContent = coutN != null ? formatNumber(coutN, 2) + ' €/m²' : '—';
  if (coutN != null && coutN1 != null && coutN1 > 0) {
    const evolPct = ((coutN - coutN1) / coutN1) * 100;
    el('immo-cout-evol').innerHTML = `
      <span style="color:${evolPct >= 0 ? '#ef4444' : '#10b981'};">
        ${evolPct >= 0 ? '▲' : '▼'} ${Math.abs(evolPct).toFixed(1)}%
      </span>
      <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>`;
  } else {
    el('immo-cout-evol').innerHTML = '';
  }
  if (consol?.moy_cout_surfacique && coutN != null) {
    const ecart    = coutN - consol.moy_cout_surfacique;
    const ecartPct = (ecart / consol.moy_cout_surfacique) * 100;
    el('immo-cout-comp').innerHTML = `<span style="color:var(--gris2);">${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)}% vs moy. ${perimetre}</span>`;
  } else {
    el('immo-cout-comp').textContent = '';
  }

  // ── Sparkline coût surfacique ───────────────────────────────────
  const histo = getImmobilierHistorique(structureId);
  const labels = histo.map(h => h.annee);
  const valeurs = histo.map(h => h.cout_surfacique);
  const valeursNonNull = valeurs.filter(v => v != null);
  const moy4ans = valeursNonNull.length > 0
    ? valeursNonNull.reduce((a, b) => a + b, 0) / valeursNonNull.length
    : null;

  el('immo-badge-4ans').textContent = `Lissé ${labels[0]}–${labels[labels.length - 1]}`;
  el('immo-cout-moyen').textContent = moy4ans != null ? formatNumber(moy4ans, 2) + ' €/m²' : '—';
  const elEnergieNote = el('immo-energie-note');
  if (elEnergieNote) elEnergieNote.textContent = 'Électricité + gaz + eau';

  const chartEl = document.getElementById('chart-immo-cout');
  if (chartEl) {
    const existing = Chart.getChart('chart-immo-cout');
    if (existing) existing.destroy();

    // Plugin inline pour afficher les valeurs au-dessus des points (sans datalabels externe)
    const pointLabelsPlugin = {
      id: 'immoPointLabels',
      afterDatasetsDraw(chart) {
        const { ctx, data, scales: { x, y } } = chart;
        ctx.save();
        ctx.font = '500 10px Marianne, system-ui, sans-serif';
        ctx.fillStyle = '#002F6C';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        data.datasets[0].data.forEach((val, i) => {
          if (val == null) return;
          const px = x.getPixelForValue(i);
          const py = y.getPixelForValue(val);
          ctx.fillText(val.toFixed(1), px, py - 6);
        });
        ctx.restore();
      }
    };

    new Chart(chartEl, {
      type: 'line',
      plugins: [pointLabelsPlugin],
      data: {
        labels,
        datasets: [{
          data: valeurs,
          borderColor: '#002F6C',
          backgroundColor: 'rgba(0,47,108,0.08)',
          borderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.3,
          spanGaps: true,
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => (ctx.parsed.y != null ? ctx.parsed.y.toFixed(1) + ' €/m²' : '—') }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: '#f0f0f0' },
            ticks: { font: { size: 10 }, callback: v => v.toFixed(1) },
            suggestedMax: moy4ans != null ? moy4ans * 1.4 : undefined
          }
        },
        layout: { padding: { top: 22 } }
      }
    });
  }

  // ── Tableaux sites ─────────────────────────────────────────────
  const { public: sitesPublic, prive: sitesPrive } = getImmobilierSites(structureId);
  const moyRatio = consol?.moy_ratio_occupation || null;
  const moyCout  = consol?.moy_cout_surfacique  || null;
  // Moyenne loyer/m² calculée sur les baux privés de la structure
  const loyersValides = sitesPrive.filter(s => s.ratio_loyer != null && s.ratio_loyer > 0);
  const moyLoyer = loyersValides.length > 0
    ? loyersValides.reduce((s, r) => s + r.ratio_loyer, 0) / loyersValides.length
    : null;

  // Helper : couleur par rapport à la moyenne (vert = mieux, rouge = plus élevé)
  // Pour ratio occupation et coût surfacique : plus bas = vert (moins de surface par résident = plus dense)
  function colorVsAvg(val, avg, inverser = false) {
    if (val == null || avg == null || avg === 0) return '';
    const mieux = inverser ? val > avg : val < avg;
    return mieux ? 'color:#10b981;font-weight:500;' : 'color:#ef4444;font-weight:500;';
  }

  function lignesSite(sites, avecBail) {
    if (sites.length === 0) return `<tr><td colspan="${avecBail ? 9 : 7}" style="text-align:center;padding:16px;color:var(--gris2);font-style:italic;">Aucun site</td></tr>`;
    return sites.map(s => {
      const ratioTxt  = (s.type_bien === 'Bureau' && s.ratio_occ != null) ? formatNumber(s.ratio_occ, 1) : '—';
      const ratioCss  = (s.type_bien === 'Bureau' && s.ratio_occ != null) ? colorVsAvg(s.ratio_occ, moyRatio) : '';
      const energieTxt = s.energie > 0 ? formatNumber(s.energie, 0) + ' €' : '—';
      const coutTxt   = s.cout_surf != null ? formatNumber(s.cout_surf, 1) : '—';
      const coutCss   = s.cout_surf != null ? colorVsAvg(s.cout_surf, moyCout) : '';
      const loyerTxt    = s.loyer_annuel > 0 ? formatNumber(s.loyer_annuel, 0) + ' €' : '—';
      const ratioLoyer  = s.ratio_loyer != null ? formatNumber(s.ratio_loyer, 1) + ' €/m²' : '—';
      const ratioLoyerCss = s.ratio_loyer != null ? colorVsAvg(s.ratio_loyer, moyLoyer) : '';
      const bailCols  = avecBail ? `
        <td style="padding:10px 12px;font-size:12px;white-space:nowrap;">${s.date_fin_bail ? formatDateBail(s.date_fin_bail) : '—'}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;">${loyerTxt}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;${ratioLoyerCss}">${ratioLoyer}</td>` : '';
      const libelleCell = avecBail && s.bailleur && s.bailleur !== '—'
        ? `<td style="padding:10px 12px;font-size:12px;font-weight:500;">${s.libelle}<br><span style="font-weight:400;color:var(--gris2);font-size:11px;">${s.bailleur}</span></td>`
        : `<td style="padding:10px 12px;font-size:12px;font-weight:500;">${s.libelle}</td>`;
      return `<tr style="border-bottom:0.5px solid var(--bord);">
        ${libelleCell}
        <td style="padding:10px 12px;font-size:12px;">${s.ville}</td>
        <td style="padding:10px 12px;font-size:12px;">${s.type_bien}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;">${s.sub > 0 ? formatNumber(s.sub, 0) : '—'}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;">${s.residents > 0 ? formatNumber(s.residents, 0) : '—'}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;${ratioCss}">${ratioTxt}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;">${energieTxt}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;${coutCss}">${coutTxt}</td>
        ${bailCols}
      </tr>`;
    }).join('');
  }

  // Tableau domaine public
  const tbodyPublic = el('table-immo-public-body');
  if (tbodyPublic) tbodyPublic.innerHTML = lignesSite(sitesPublic, false);
  const sectionPublic = el('immo-section-public');
  if (sectionPublic) sectionPublic.style.display = sitesPublic.length > 0 ? '' : 'none';

  // Tableau baux privés
  const tbodyPrive = el('table-immo-prive-body');
  if (tbodyPrive) tbodyPrive.innerHTML = lignesSite(sitesPrive, true);
  const sectionPrive = el('immo-section-prive');
  if (sectionPrive) sectionPrive.style.display = sitesPrive.length > 0 ? '' : 'none';

  // ── Commentaire ────────────────────────────────────────────────
  initSectionMDE('immo-commentaire', structureId, annee, 'Immobilier');
}

function refreshImmobilierPlaceholder() {
  const ids = ['immo-sub-value','immo-sites-value','immo-ratio-value','immo-cout-value'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '—';
  });
  ['immo-ratio-comp','immo-cout-evol','immo-cout-comp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  const tbody = document.getElementById('table-immo-public-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:16px;color:var(--gris2);font-style:italic;">Aucune donnée immobilier</td></tr>';
  const tbodyP = document.getElementById('table-immo-prive-body');
  if (tbodyP) tbodyP.innerHTML = '';
}

function formatDateBail(ts) {
  if (!ts) return '—';
  let d;
  if (typeof ts === 'string') {
    // Format ISO YYYY-MM-DD
    const p = ts.split('-');
    d = new Date(Date.UTC(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])));
  } else {
    // Timestamp Unix en secondes (format Grist pour colonnes Date)
    d = new Date(ts * 1000);
  }
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR');
}

function createImmobilierCoutChart(structureId) {
  // Alias pour compatibilité — appelle refreshImmobilier
}

function function_renderMarkdownToPDF_placeholder() {} // sentinelle

function cleanForPDF(str) {
  if (!str) return '';
  str = str
    .replace(/→/g, '->').replace(/←/g, '<-')
    .replace(/–/g, '-').replace(/—/g, '--')
    .replace(/…/g, '...')
    .replace(/°/g, 'deg')
    .replace(/‘/g, "'").replace(/’/g, "'")
    .replace(/“/g, '"').replace(/”/g, '"')
    .replace(/«/g, '"').replace(/»/g, '"')
    .replace(/•/g, '*');
  str = str.replace(/&[^;\s]{1,6}/g, function(m) {
    const valid = ['&amp', '&lt', '&gt', '&nbsp', '&quot', '&apos'];
    if (valid.some(function(v) { return m.startsWith(v); })) return m;
    return '';
  });
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (cp > 0xFFFF) { i++; continue; }
    if (cp > 0x024F && cp !== 0x20AC) continue; // 0x20AC = €, supporté par WinAnsi/Helvetica
    out += str[i];
  }
  return out.replace(/  +/g, ' ').replace(/ ([.,;:!?)»])/g, '$1').trim();
  }

// ═══════════════════════════════════════════════════════════════
function renderMarkdownToPDF(pdf, markdownText, x, ctx, maxWidth) {
  if (!markdownText || !markdownText.trim()) return;
  // Reset systématique avant tout rendu pour homogénéité
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 30, 40);


  const FONT_SIZE_NORMAL = 8.5;
  const FONT_SIZE_H1     = 10.5;
  const FONT_SIZE_H2     = 9.5;
  const FONT_SIZE_H3     = 9;
  const LINE_HEIGHT      = 4.2;
  const PARA_GAP         = 1.0;
  const LIST_INDENT      = 3.5;
  const SUB_INDENT       = 7;

  const COLOR_TEXT   = [30,  30,  40];
  const COLOR_TITLE  = [0,   47, 108];
  const COLOR_BULLET = [0,   83, 160];

  function ensureSpace(needed) {
    if (ctx.availableMm() < needed) ctx.addPage();
  }

  function parseInline(text) {
    const tokens = [];
    const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) tokens.push({ text: text.slice(last, m.index), bold: false, italic: false });
      if (m[0].startsWith('***'))     tokens.push({ text: m[2], bold: true, italic: true });
      else if (m[0].startsWith('**')) tokens.push({ text: m[3], bold: true, italic: false });
      else                            tokens.push({ text: m[4], bold: false, italic: true });
      last = m.index + m[0].length;
    }
    if (last < text.length) tokens.push({ text: text.slice(last), bold: false, italic: false });
    return tokens.length ? tokens : [{ text, bold: false, italic: false }];
  }

  // Écrit une liste de tokens inline avec rendu mixte gras/italique par token,
  // avec word-wrap manuel respectant les frontières de tokens.
  function writeInlineTokens(tokens, fontSize, baseColor, indent, isBullet) {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...baseColor);
    if (!tokens.length) return;

    // Construire la liste de "mots" avec leur style, pour wrapper proprement
    // Approche : concaténer en fullText pour splitTextToSize, puis réécrire token par token.
    // Pour la version actuelle on fait un wrapper simple token-aware sur une ligne à la fois.
    const effectiveWidth = maxWidth - indent;

    // Construire la liste de segments {text, bold, italic} en découpant par mots
    // Puis écrire ligne par ligne en gérant les styles.
    let lineTokens = []; // tokens de la ligne courante
    let lineWidth = 0;
    let isFirstLine = true;

    function flushLine(isLast) {
      if (!lineTokens.length) return;
      ensureSpace(LINE_HEIGHT + 1);
      // Bullet sur la première ligne seulement
      if (isBullet && isFirstLine) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(FONT_SIZE_NORMAL);
        pdf.setTextColor(...COLOR_BULLET);
        pdf.text('-', x + indent - 3, ctx.y);
        isFirstLine = false;
      }
      let curX = x + indent;
      let prevText = '';
      lineTokens.forEach(function(seg) {
        if (!seg.text) return;
        // Supprimer l'espace de tête si le segment précédent se termine par une apostrophe
        let txt = seg.text;
        if (prevText.endsWith("'") && txt.startsWith(' ')) txt = txt.slice(1);
        const style = seg.bold && seg.italic ? 'bolditalic'
                    : seg.bold ? 'bold'
                    : seg.italic ? 'italic' : 'normal';
        pdf.setFont('helvetica', style);
        pdf.setTextColor(...baseColor);
        pdf.text(txt, curX, ctx.y);
        curX += pdf.getTextWidth(txt);
        prevText = txt;
      });
      ctx.y += LINE_HEIGHT;
      lineTokens = [];
      lineWidth = 0;
    }

    tokens.forEach(function(tok) {
      const style = tok.bold && tok.italic ? 'bolditalic'
                  : tok.bold ? 'bold'
                  : tok.italic ? 'italic' : 'normal';
      pdf.setFont('helvetica', style);
      // Découper le token en mots, en filtrant les mots vides
      const words = cleanForPDF(tok.text).split(' ').filter(function(w) { return w.length > 0; });
      words.forEach(function(word, wi) {
        // Supprimer l'espace de tête si le mot commence par une ponctuation fermante
        const noSpaceBefore = /^[)}\].,;:!?»]/.test(word);
        // Supprimer l'espace de tête si le segment précédent se termine par une apostrophe
        const prevEndsApostrophe = lineTokens.length > 0 && lineTokens[lineTokens.length-1].text.endsWith("'");
        const space = (wi > 0 || lineTokens.length > 0) && !noSpaceBefore && !prevEndsApostrophe ? ' ' : '';
        const segment = space + word;
        const segW = pdf.getTextWidth(segment);
        if (lineWidth + segW > effectiveWidth && lineWidth > 0) {
          flushLine(false);
          const wordOnly = word;
          const wordW = pdf.getTextWidth(wordOnly);
          lineTokens.push({ text: wordOnly, bold: tok.bold, italic: tok.italic });
          lineWidth = wordW;
        } else {
          // Ajouter au token courant sur la ligne
          if (lineTokens.length > 0 && lineTokens[lineTokens.length-1].bold === tok.bold && lineTokens[lineTokens.length-1].italic === tok.italic) {
            lineTokens[lineTokens.length-1].text += segment;
          } else {
            lineTokens.push({ text: segment, bold: tok.bold, italic: tok.italic });
          }
          lineWidth += segW;
        }
      });
    });
    flushLine(true);
  }

  // Pré-traiter les lignes : un backslash final (\) = saut de ligne visuel (ligne vide insérée)
  const rawLines = markdownText.replace(/\r\n/g, '\n').split('\n');
  const lines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i].trimEnd();
    if (l.endsWith('\\')) {
      // Retirer le backslash et émettre la ligne, puis une ligne vide (saut de ligne)
      lines.push(l.slice(0, -1).trimEnd());
      lines.push('');
    } else {
      lines.push(l);
    }
  }

  function renderHeading(rawContent, fontSize, underline) {
    // Supprimer les marqueurs **gras** et *italique* du contenu titre pour afficher en bold simple
    const title = cleanForPDF(rawContent.replace(/\*+([^*]+)\*+/g, '$1').trim());
    if (!title) return;
    ensureSpace(LINE_HEIGHT + PARA_GAP + 2);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...COLOR_TITLE);
    pdf.splitTextToSize(title, maxWidth).forEach(function(t) {
      pdf.text(t, x, ctx.y);
      ctx.y += LINE_HEIGHT + (fontSize > FONT_SIZE_NORMAL ? 0.5 : 0);
    });
    if (underline) {
      pdf.setDrawColor(180, 200, 230);
      pdf.setLineWidth(0.3);
      pdf.line(x, ctx.y - 1, x + maxWidth, ctx.y - 1);
    }
    ctx.y += PARA_GAP;
  }

  lines.forEach(function(rawLine) {
    const line = rawLine.trimEnd();
    if (!line.trim()) { ctx.y += PARA_GAP; return; }

    // Séparateur horizontal : ligne composée uniquement de * ou - ou _
    if (/^\s*(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      ensureSpace(4);
      pdf.setDrawColor(180, 200, 230);
      pdf.setLineWidth(0.3);
      pdf.line(x, ctx.y - 1, x + maxWidth, ctx.y - 1);
      ctx.y += PARA_GAP;
      return;
    }

    // H4 ####
    if (/^#{4}\s+/.test(line)) {
      renderHeading(line.replace(/^#{4}\s+/, ''), FONT_SIZE_H3, false);
      return;
    }

    // H3 ###
    if (/^#{3}\s+/.test(line)) {
      renderHeading(line.replace(/^#{3}\s+/, ''), FONT_SIZE_H3, false);
      return;
    }

    // H2 ##
    if (/^#{2}\s+/.test(line)) {
      renderHeading(line.replace(/^#{2}\s+/, ''), FONT_SIZE_H2, true);
      return;
    }

    // H1 #
    if (/^#\s+/.test(line)) {
      renderHeading(line.replace(/^#\s+/, ''), FONT_SIZE_H1, true);
      return;
    }

    // Sous-liste indentée
    if (/^(\s{2,}|\t)[\-\*]\s+/.test(line)) {
      const content = line.replace(/^[\s\t]+[\-\*]\s+/, '');
      writeInlineTokens(parseInline(content), FONT_SIZE_NORMAL, COLOR_TEXT, SUB_INDENT, true);
      return;
    }

    // Liste niveau 1
    if (/^[\-\*]\s+/.test(line)) {
      const content = line.replace(/^[\-\*]\s+/, '');
      writeInlineTokens(parseInline(content), FONT_SIZE_NORMAL, COLOR_TEXT, LIST_INDENT, true);
      return;
    }

    // Paragraphe normal
    writeInlineTokens(parseInline(line), FONT_SIZE_NORMAL, COLOR_TEXT, 0, false);
  });
}


async function addStructureToPDF(pdf, struct, annee, isFirstPage) {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const headerHeight = 18;
  const footerHeight = 12;
  
  let currentPage = 1;
  let yPosition = margin + headerHeight + 5;
  const dateExport = new Date().toLocaleDateString('fr-FR');
  
  // Charger le logo des Douanes
  let logoData = null;
  try {
    const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Logo_des_Douanes_Fran%C3%A7aises.svg';
    const response = await fetch(logoUrl);
    const svgText = await response.text();
    
    // Convertir SVG en image pour jsPDF
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    await new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 200, 200);
        logoData = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(); // Continue sans logo si erreur
      };
      img.src = url;
    });
  } catch (error) {
  }
  
  function addHeaderFooter(pageNum) {
    // Bande bleue
    pdf.setFillColor(0, 47, 108);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Logo à gauche (si chargé)
    if (logoData) {
      const logoSize = 12; // 12mm de hauteur
      const logoY = (headerHeight - logoSize) / 2;
      pdf.addImage(logoData, 'PNG', margin, logoY, logoSize, logoSize);
    }
    
    // Texte de l'en-tête (décalé pour laisser place au logo)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    
    const textStartX = margin + (logoData ? 15 : 0); // Décalage si logo présent
    const maxWidth = pageWidth - textStartX - margin;
    let headerText = `Fiche Identité - ${struct.nom}`;
    let textWidth = pdf.getTextWidth(headerText);
    
    if (textWidth > maxWidth) {
      headerText = `Fiche Identité - ${struct.sigle}`;
      textWidth = pdf.getTextWidth(headerText);
      if (textWidth > maxWidth) {
        while (textWidth > maxWidth - 5 && headerText.length > 20) {
          headerText = headerText.slice(0, -1);
          textWidth = pdf.getTextWidth(headerText + '...');
        }
        headerText += '...';
      }
    }
    
    pdf.text(headerText, textStartX, 11);
    
    // Pied de page
    const footerY = pageHeight - footerHeight + 3;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, footerY, pageWidth - margin, footerY);
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');

    // Gauche : sigle structure
    pdf.text(struct.sigle || struct.nom, margin, footerY + 5);

    // Centre : Page X / N
    // _totalPages sera 0 pendant la génération (1ère passe) → écrit "Page X"
    // Après génération, on rappelle addHeaderFooter via une 2e passe légère si possible
    const pageLabel = `Page ${pageNum}${_totalPages > 0 ? ' / ' + _totalPages : ''}`;
    const pageLabelW = pdf.getTextWidth(pageLabel);
    pdf.text(pageLabel, (pageWidth - pageLabelW) / 2, footerY + 5);
    _footerPageNums.push({ pageNum, footerY });

    // Droite : date export
    const dateText = `Exporté le ${dateExport}`;
    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, pageWidth - margin - dateWidth, footerY + 5);
  }
  
  function checkPageBreak(neededHeight) {
    const availableHeight = pageHeight - footerHeight - margin - yPosition;
    if (availableHeight < neededHeight) {
      addHeaderFooter(currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = margin + headerHeight + 5;
      return true;
    }
    return false;
  }
  
  let _totalPages = 0;
  const _footerPageNums = [];

  if (!isFirstPage) addHeaderFooter(currentPage);

  // ── PAGE DE GARDE (structure unique seulement) ──────────────────────
  if (isFirstPage) {
    // Fond blanc, logo centré, titre, infos structure, date
    const cx = pageWidth / 2;

    // Bande bleue supérieure (même hauteur que l'en-tête)
    pdf.setFillColor(0, 47, 108);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');

    // Logo centré (si disponible)
    const logoSize = 30;
    const logoX = cx - logoSize / 2;
    const logoY = 40;
    if (logoData) {
      pdf.addImage(logoData, 'PNG', logoX, logoY, logoSize, logoSize);
    }

    // Nom complet de la structure avec sigle entre parenthèses
    const hasDistinctName = struct.nom && struct.nom !== struct.sigle;
    const nomPrincipal = hasDistinctName ? struct.nom : (struct.sigle || struct.nom);
    const nomSigle = hasDistinctName ? `(${struct.sigle})` : '';

    // Nom principal avec word-wrap pour les noms longs
    const nomFontSize = hasDistinctName ? 15 : 22;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(nomFontSize);
    pdf.setTextColor(0, 47, 108);
    const nomMaxW = pageWidth - 2 * margin - 10;
    const nomLines = pdf.splitTextToSize(nomPrincipal, nomMaxW);
    const nomLineH = nomFontSize * 0.352 + 2; // mm par ligne approx
    let nomYBase = logoY + logoSize + 16;
    nomLines.forEach((line, i) => {
      const lw = pdf.getTextWidth(line);
      pdf.text(line, cx - lw / 2, nomYBase + i * nomLineH);
    });
    const nomBlockH = nomLines.length * nomLineH;

    if (nomSigle) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(74, 90, 106);
      const sigleW = pdf.getTextWidth(nomSigle);
      pdf.text(nomSigle, cx - sigleW / 2, nomYBase + nomBlockH + 2);
    }

    // Ligne décorative — décalée selon présence du sigle et hauteur du nom
    const lineY = nomYBase + nomBlockH + (nomSigle ? 10 : 6);
    pdf.setDrawColor(0, 47, 108);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 30, lineY, pageWidth - margin - 30, lineY);

    // Sous-infos : type, région
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    const infos = [
      struct.type_label || struct.Type || '',
      struct.region || struct.Region || ''
    ].filter(Boolean).join('  ·  ');
    if (infos) {
      const infosW = pdf.getTextWidth(infos);
      pdf.text(infos, cx - infosW / 2, lineY + 10);
    }

    // Fiche Identité
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(0, 47, 108);
    const ficheLabel = "Fiche Identite";
    const ficheLabelW = pdf.getTextWidth(ficheLabel);
    pdf.text(ficheLabel, cx - ficheLabelW / 2, lineY + 24);



    // Date d'export en bas de page
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    const dateLabel = `Exporte le ${dateExport}`;
    const dateLabelW = pdf.getTextWidth(dateLabel);
    pdf.text(dateLabel, cx - dateLabelW / 2, pageHeight - 20);

    pdf.addPage();
    currentPage++;
    yPosition = margin + headerHeight + 5;
    addHeaderFooter(currentPage);
  }
  
  const ficheBody = document.getElementById('fiche-body');
  
  // ── Collecte des valeurs markdown ET masquage des éditeurs EasyMDE ─
  // IMPORTANT : lire value() AVANT display:none (EasyMDE retourne '' si masqué)
  const _mdeContainers = [];
  const _mdeSectionValues = new Map(); // section element → mdValue string

  // Stratégie de lecture robuste :
  // 1. Lire via _mdeInstances (keyed par textarea id) — source de vérité EasyMDE
  // 2. Fallback : lire le textarea natif directement par id connu
  // 3. Fallback : chercher tout textarea dans la section
  const _knownMdeIds = ['rh-commentaire','budget-commentaire','com-commentaire',
                        'fonct-commentaire','fm-commentaire','it-commentaire','veh-commentaire','immo-commentaire'];

  // D'abord : collecter toutes les valeurs depuis _mdeInstances directement
  const _mdeValueById = {};
  _knownMdeIds.forEach(id => {
    if (_mdeInstances[id]) {
      _mdeValueById[id] = _mdeInstances[id].value();
      } else {
      const ta = document.getElementById(id);
      _mdeValueById[id] = ta ? ta.value : '';
      }
  });

  // Associer chaque section à sa valeur via le textarea qu'elle contient
  ficheBody.querySelectorAll('.section').forEach(section => {
    // Chercher un textarea connu dans cette section
    let val = '';
    for (const id of _knownMdeIds) {
      const ta = section.querySelector('#' + id);
      if (ta) {
        val = _mdeValueById[id] || '';
        break;
      }
    }
    // Fallback : n'importe quel textarea dans la section
    if (!val) {
      const anyTa = section.querySelector('textarea');
      if (anyTa && anyTa.id && _mdeInstances[anyTa.id]) {
        val = _mdeInstances[anyTa.id].value();
      } else if (anyTa) {
        val = anyTa.value || '';
      }
    }
    _mdeSectionValues.set(section, val);
  });

  // Masquer tous les containers EasyMDE après lecture
  ficheBody.querySelectorAll('.EasyMDEContainer').forEach(container => {
    container.style.display = 'none';
    _mdeContainers.push(container);
  });

  // Wrapper de checkPageBreak qui met à jour yPosition via closure
  // + objet contexte partagé pour renderMarkdownToPDF
  const _pdfCtx = {
    get y() { return yPosition; },
    set y(v) { yPosition = v; },
    availableMm() { return pageHeight - footerHeight - margin - yPosition; },
    addPage() {
      addHeaderFooter(currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = margin + headerHeight + 5;
      // Reset police après saut de page pour éviter contamination
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(30, 30, 40);
    }
  };
  function _checkPageBreak(neededHeight) {
    if (_pdfCtx.availableMm() < neededHeight) {
      _pdfCtx.addPage();
      return true;
    }
    return false;
  }

  // ── Helper partagé : supprime les @font-face Marianne dans le clone html2canvas ──
  // Évite les blocages réseau sur les woff2 jsdelivr inaccessibles depuis Grist
  function _h2cOnClone(clonedDoc) {
    try {
      Array.from(clonedDoc.styleSheets).forEach(function(sheet) {
        try {
          var rules = Array.from(sheet.cssRules || []);
          for (var i = rules.length - 1; i >= 0; i--) {
            if (rules[i].type === CSSRule.FONT_FACE_RULE) {
              sheet.deleteRule(i);
            }
          }
        } catch(e) {}
      });
      // Forcer une police système sur le document cloné
      var s = clonedDoc.createElement('style');
      s.textContent = '* { font-family: Arial, Helvetica, sans-serif !important; }';
      clonedDoc.head.appendChild(s);
    } catch(e) {}
  }

  // ── Fonction utilitaire : capture un élément en image et l'insère dans le PDF ──
  // Mesure la hauteur réelle après capture canvas, saute de page si nécessaire,
  // puis place l'image. Slicing uniquement pour les blocs > une page entière.
  async function captureElementToImage(element) {
    if (!element || element.scrollHeight < 5) return;

    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth, height: element.scrollHeight,
      onclone: _h2cOnClone
    });

    const imgWidth   = pageWidth - (2 * margin);
    const pxToMm     = imgWidth / canvas.width;
    const imgHeight  = canvas.height * pxToMm;
    const fullPageH  = pageHeight - footerHeight - margin - (margin + headerHeight + 5);

    function doPageBreak() { _pdfCtx.addPage(); }

    if (imgHeight <= fullPageH) {
      // Hauteur réelle connue : saut propre si besoin, puis placement direct
      const availMm = pageHeight - footerHeight - margin - yPosition;
      if (availMm < imgHeight || availMm < 15) doPageBreak();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 3;
    } else {
      // Bloc plus grand qu'une page.
      // Si c'est un élément .section, on re-capture ses enfants directs un par un
      // (en groupant les 2 premiers : section-header + KPIs) plutôt que de slicer.
      // Sinon on slicera (tableaux très longs inévitables).
      const isSection = element.classList && element.classList.contains('section');
      if (isSection) {
        // Trouver le commentDiv pour l'exclure
        const innerMde = element.querySelector('.EasyMDEContainer');
        let innerCommentDiv = null;
        if (innerMde) {
          let n = innerMde;
          while (n.parentNode && n.parentNode !== element) n = n.parentNode;
          if (n !== element) innerCommentDiv = n;
        }
        const kids = Array.from(element.children).filter(c =>
          c !== innerCommentDiv && c.style.display !== 'none' && c.scrollHeight > 5
        );

        // Aplatir récursivement les enfants trop grands (> une page) en leurs sous-enfants
        // → traite les tableaux de sites Immobilier et autres blocs profonds
        async function flattenForPDF(el) {
          const elH = el.scrollHeight * (imgWidth / (el.scrollWidth || 1));
          if (elH <= fullPageH) return [el]; // tient sur une page → bloc unitaire
          // Trop grand → descendre dans ses enfants directs visibles
          const subKids = Array.from(el.children).filter(c =>
            c.style.display !== 'none' && c.scrollHeight > 5
          );
          if (subKids.length === 0) return [el]; // pas d'enfants → forcer slicing
          const result = [];
          for (const k of subKids) result.push(...await flattenForPDF(k));
          return result;
        }

        // Grouper le premier enfant (section-header, petit) avec le suivant
        let groups = [];
        if (kids.length >= 2 && (kids[0].scrollHeight || 0) < 80) {
          groups.push([kids[0], kids[1]]);
          for (let i = 2; i < kids.length; i++) {
            const flat = await flattenForPDF(kids[i]);
            flat.forEach(f => groups.push([f]));
          }
        } else {
          for (const k of kids) {
            const flat = await flattenForPDF(k);
            flat.forEach(f => groups.push([f]));
          }
        }

        for (const group of groups) {
          const captured = [];
          for (const el of group) {
            const c2 = await html2canvas(el, { scale:2, useCORS:true, logging:false, backgroundColor:'#ffffff', onclone:_h2cOnClone });
            const h2 = c2.height * (imgWidth / c2.width);
            captured.push({ h: h2, data: c2.toDataURL('image/jpeg', 0.95) });
          }
          const totalGroupH = captured.reduce((s, item) => s + item.h + 1, 0);
          const avail = pageHeight - footerHeight - margin - yPosition;
          if (totalGroupH <= fullPageH && avail < totalGroupH) doPageBreak();
          for (const item of captured) {
            const av2 = pageHeight - footerHeight - margin - yPosition;
            if (item.h <= fullPageH && av2 < item.h) doPageBreak();
            pdf.addImage(item.data, 'JPEG', margin, yPosition, imgWidth, item.h);
            yPosition += item.h + 1;
          }
        }
        yPosition += 2;
      } else {
        // Slicing classique pour les blocs non-section (tableaux longs, etc.)
        const canvasW = canvas.width;
        const canvasH = canvas.height;
        let srcY = 0;
        while (srcY < canvasH) {
          const availMm = pageHeight - footerHeight - margin - yPosition;
          const availPx = Math.floor(availMm / pxToMm);
          const remainPx = canvasH - srcY;
          if (availMm < 20 || availPx <= 0) { doPageBreak(); continue; }
          const slicePx = Math.min(availPx, remainPx);
          const sliceH  = slicePx * pxToMm;
          const sl = document.createElement('canvas');
          sl.width = canvasW; sl.height = slicePx;
          sl.getContext('2d').drawImage(canvas, 0, srcY, canvasW, slicePx, 0, 0, canvasW, slicePx);
          pdf.addImage(sl.toDataURL('image/jpeg', 0.95), 'JPEG', margin, yPosition, imgWidth, sliceH);
          yPosition += sliceH;
          srcY += slicePx;
          if (srcY < canvasH) doPageBreak();
        }
        yPosition += 3;
      }
    }
  }

  // ── 1. En-tête + Vue d'ensemble : header image, pills image, texte natif ──
  const ficheHeader = ficheBody.querySelector('.fiche-header');
  const mainCommentBox = ficheBody.querySelector('#main-comment-box');

  // Masquer la vignette fiche-header (le header PDF suffit)
  if (ficheHeader) ficheHeader.style.display = 'none';

  if (mainCommentBox && mainCommentBox.offsetParent) {
    const vdeBtns = mainCommentBox.querySelectorAll('.comment-edit-btn, .comment-save-btn, .comment-cancel-btn');
    vdeBtns.forEach(btn => { btn.dataset.pdfHidden = btn.style.display; btn.style.display = 'none'; });
    const vdePillsEditor = mainCommentBox.querySelector('.pills-editor');
    if (vdePillsEditor) vdePillsEditor.style.display = 'none';
    const vdeTextarea = mainCommentBox.querySelector('textarea');
    if (vdeTextarea) { vdeTextarea.dataset.pdfHidden = vdeTextarea.style.display; vdeTextarea.style.display = 'none'; }
    // Masquer la description pour ne capturer que header + pills
    const vdeDesc = mainCommentBox.querySelector('#comment-description, .comment-description');
    if (vdeDesc) vdeDesc.style.display = 'none';
    const vdePillsWrapper = mainCommentBox.querySelector('.comment-pills-wrapper');
    if (vdePillsWrapper) vdePillsWrapper.style.display = '';

    const imgW = pageWidth - (2 * margin);
    const fullPageH = pageHeight - footerHeight - margin - (margin + headerHeight + 5);

    // Capturer le header fiche
    let hHeader = 0, dataHeader = null;
    if (ficheHeader && ficheHeader.offsetParent) {
      const cHeader = await html2canvas(ficheHeader, { scale:2, useCORS:true, logging:false, backgroundColor:'#ffffff', width:ficheHeader.scrollWidth, height:ficheHeader.scrollHeight, onclone:_h2cOnClone });
      hHeader = cHeader.height * (imgW / cHeader.width);
      dataHeader = cHeader.toDataURL('image/jpeg', 0.95);
    }

    // Capturer le bloc pills (sans la description)
    const cPills = await html2canvas(mainCommentBox, { scale:2, useCORS:true, logging:false, backgroundColor:'#ffffff', width:mainCommentBox.scrollWidth, height:mainCommentBox.scrollHeight, onclone:_h2cOnClone });
    const hPills = cPills.height * (imgW / cPills.width);

    // Lire le markdown du commentaire général
    const mdGeneralValue = (typeof getCommentaire === 'function' && FICHE_STATE.structure && FICHE_STATE.annee)
      ? (getCommentaire(FICHE_STATE.structure.id, FICHE_STATE.annee, 'Synthese') || '') : '';

    // Restaurer la description avant placement
    if (vdeDesc) vdeDesc.style.display = '';

    // Placer le header (toujours en début de première page)
    if (dataHeader) {
      pdf.addImage(dataHeader, 'JPEG', margin, yPosition, imgW, hHeader);
      yPosition += hHeader + 3;
    }

    // Placer bloc pills : saut seulement si < 30mm disponibles
    const avail0 = pageHeight - footerHeight - margin - yPosition;
    if (avail0 < 30) _pdfCtx.addPage();
    pdf.addImage(cPills.toDataURL('image/jpeg', 0.95), 'JPEG', margin, yPosition, imgW, hPills);
    yPosition += hPills + 2;

    // Rendu natif du texte du commentaire général
    if (mdGeneralValue && mdGeneralValue.trim()) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      _pdfCtx.y = yPosition;
      renderMarkdownToPDF(pdf, mdGeneralValue, margin + 3, _pdfCtx, imgW - 6);
      yPosition = _pdfCtx.y + 4;
    }

    vdeBtns.forEach(btn => { btn.style.display = btn.dataset.pdfHidden || ''; delete btn.dataset.pdfHidden; });
    if (vdePillsEditor) vdePillsEditor.style.display = '';
    if (vdeTextarea) { vdeTextarea.style.display = vdeTextarea.dataset.pdfHidden || ''; delete vdeTextarea.dataset.pdfHidden; }

  } else if (ficheHeader && ficheHeader.offsetParent) {
    await captureElementToImage(ficheHeader);
  }

  // Restaurer ficheHeader
  if (ficheHeader) ficheHeader.style.display = '';

  // ── 3. Sections indicateurs : corps KPI en image + commentaire en natif ──
  // On parcourt les enfants directs de fiche-body pour capturer aussi les zone-header
  const imgWidth = pageWidth - (2 * margin);
  const mdTextWidth = imgWidth - 4; // légère marge intérieure

  const ficheBodyChildren = Array.from(ficheBody.children);

  for (const child of ficheBodyChildren) {
    // Ignorer éléments cachés et hors DOM
    if (child.style.display === 'none' || !child.offsetParent) continue;

    // Zone-header → sous-page de garde dédiée
    if (child.classList.contains('zone-header')) {
      // Toujours nouvelle page
      const topThreshold = margin + headerHeight + 8;
      if (yPosition > topThreshold) _pdfCtx.addPage();

      // Détection par classe CSS (plus fiable que le texte innerText)
      const isGestion = child.classList.contains('zone-gestion');
      const zoneTitle = isGestion ? 'Indicateurs de gestion' : 'Indicateurs budgetaires';
      const zoneSub = isGestion ? '2022 - 2025' : 'Annee en cours';

      // Collecter les titres des sections de cette zone
      // (tous les .section jusqu'au prochain .zone-header ou fin de fiche-body)
      const zoneSections = [];
      let sibling = child.nextElementSibling;
      while (sibling && !sibling.classList.contains('zone-header')) {
        if (sibling.classList.contains('section') &&
            sibling.style.display !== 'none' && sibling.offsetParent) {
          const titleEl = sibling.querySelector('.section-title');
          const titleText = cleanForPDF((titleEl ? titleEl.innerText : '').trim());
          if (titleText) zoneSections.push(titleText);
        }
        sibling = sibling.nextElementSibling;
      }

      // Sous-page de garde sobre style institutionnel
      const zcx = pageWidth / 2;
      const zcy = pageHeight / 2;

      // ── Watermark EN PREMIER (rendu en arrière-plan) ──
      const zoneNum = isGestion ? '02' : '01';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(110);
      pdf.setTextColor(238, 241, 248);
      const znW = pdf.getTextWidth(zoneNum);
      // Centré verticalement sur la page
      pdf.text(zoneNum, zcx - znW / 2, zcy + 45);

      // ── Filets et textes PAR-DESSUS le watermark ──
      // Filet fin au-dessus du titre
      pdf.setDrawColor(0, 47, 108);
      pdf.setLineWidth(0.4);
      pdf.line(margin + 25, zcy - 22, pageWidth - margin - 25, zcy - 22);

      // Titre zone en bleu marine bold
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 47, 108);
      const ztW = pdf.getTextWidth(zoneTitle);
      pdf.text(zoneTitle, zcx - ztW / 2, zcy - 12);

      // Sous-titre années en gris moyen
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(110, 120, 135);
      const zsW = pdf.getTextWidth(zoneSub);
      pdf.text(zoneSub, zcx - zsW / 2, zcy - 4);

      // Filet fin en dessous
      pdf.setDrawColor(0, 47, 108);
      pdf.setLineWidth(0.4);
      pdf.line(margin + 25, zcy, pageWidth - margin - 25, zcy);

      // ── Sommaire des indicateurs de la zone ──
      if (zoneSections.length > 0) {
        const summaryStartY = zcy + 10;
        const lineH = 7;
        const dotX = zcx - 35; // point de départ pour les puces (centré approximativement)

        // Calculer la largeur max pour centrer le bloc
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        let maxW = 0;
        zoneSections.forEach(sec => {
          const w = pdf.getTextWidth('• ' + sec);
          if (w > maxW) maxW = w;
        });
        const blockX = zcx - maxW / 2;

        zoneSections.forEach((sec, idx) => {
          const yy = summaryStartY + idx * lineH;
          // Puce bleue
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(0, 47, 108);
          pdf.text('•', blockX, yy);
          // Texte de l'indicateur
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 75, 95);
          pdf.text(sec, blockX + 4, yy);
        });
      }

      // Nouvelle page pour le contenu
      _pdfCtx.addPage();
      continue;
    }

    // Traiter uniquement les .section (ignorer tout autre div de structure)
    if (!child.classList.contains('section')) continue;

    const section = child;
    if (section.style.display === 'none' || !section.offsetParent) continue;

    // ── Détection section sans données ──────────────────────────────────
    // Si la section ne contient que des tirets "—" et le message "Aucune donnée",
    // et qu'aucun Chart.js n'est initialisé → bandeau compact, pas de capture complète
    const _hasChart = Array.from(section.querySelectorAll('canvas')).some(c => {
      if (typeof Chart === 'undefined') return false;
      const ch = Chart.getChart(c);
      if (!ch) return false;
      // Un chart avec toutes les données à 0 ou null ne compte pas comme "avec données"
      const allZero = (ch.data.datasets || []).every(ds =>
        (ds.data || []).every(v => !v || v === 0)
      );
      return !allZero;
    });
    const _sectionText = section.innerText || '';
    // Compter les cellules de valeur qui ont un vrai contenu (pas juste "—" ou vide)
    const _kpiValues = Array.from(section.querySelectorAll('.kpi-value, .kpi-number, [class*="kpi-val"]'));
    const _hasRealKpi = _kpiValues.some(el => {
      const t = (el.innerText || '').trim();
      if (!t || t === '—' || t === '-' || t === '') return false;
      // Valeurs réellement nulles : 0, 0 K€, 0 €, 0,00, 0.00
      if (/^0[\s,.]?(K€|€|%)?$/.test(t)) return false;
      if (/^0[,.]0+$/.test(t)) return false;
      return true;
    });
    const _isEmptySection = !_hasChart && !_hasRealKpi &&
      (_sectionText.includes('Aucune donn') || _sectionText.includes('aucune donn') ||
       !_sectionText.replace(/[—\-\s\n\r]/g, '').replace(/Analysedelindicateur/g, '').trim());

    if (_isEmptySection) {
      // Bandeau compact "pas de données" au lieu de la section complète
      const mdVal0 = _mdeSectionValues.get(section) || '';
      // Chercher le titre dans .section-title, h2, ou le span de titre du section-header
      const secTitleEl = section.querySelector('.section-title, .section-header h2, .section-header h3, h2, h3, [class*="section-name"]');
      const secTitleRaw = secTitleEl ? (secTitleEl.innerText || '').split('\n')[0].trim() : '';
      const secTitle = cleanForPDF(secTitleRaw) || 'Indicateur';

      _checkPageBreak(20);
      const bW = pageWidth - 2 * margin;
      // Titre de section sobre
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 47, 108);
      pdf.text(secTitle, margin, yPosition + 4);
      // Filet fin sous le titre
      pdf.setDrawColor(180, 200, 225);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yPosition + 6, margin + bW, yPosition + 6);
      yPosition += 9;
      // Bandeau compact "Aucune donnée disponible"
      pdf.setFillColor(247, 248, 250);
      pdf.setDrawColor(215, 222, 232);
      pdf.setLineWidth(0.2);
      pdf.rect(margin, yPosition, bW, 6, 'FD');
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7.5);
      pdf.setTextColor(150, 158, 172);
      pdf.text('Aucune donnee disponible', margin + 3, yPosition + 4.2);
      yPosition += 9;

      // Si commentaire quand même, l'afficher sans rectangle global
      if (mdVal0 && mdVal0.trim()) {
        _checkPageBreak(16);
        const innerX2 = margin + 7;
        const innerW2 = (pageWidth - 2 * margin) - 10;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(80, 110, 160);
        pdf.text("Analyse de l'indicateur", innerX2, yPosition + 3.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(30, 30, 40);
        yPosition = yPosition + 7;
        _pdfCtx.y = yPosition;
        renderMarkdownToPDF(pdf, mdVal0, innerX2, _pdfCtx, innerW2);
        yPosition = _pdfCtx.y + 4;
      }
      yPosition += 2;
      continue; // sauter la capture html2canvas de cette section
    }

    // Valeur markdown déjà lue avant masquage (via _mdeSectionValues)
    const mdValue = _mdeSectionValues.get(section) || '';

    // Identifier le div-commentaire : enfant direct de .section contenant le EasyMDEContainer
    let commentDiv = null;
    const mdeInSection = section.querySelector('.EasyMDEContainer');
    if (mdeInSection) {
      let node = mdeInSection;
      while (node.parentNode && node.parentNode !== section) node = node.parentNode;
      if (node !== section) {
        commentDiv = node;
        commentDiv.dataset.exportHidden = commentDiv.style.display || '';
        commentDiv.style.display = 'none';
      }
    }

    // Masquer les chart-wrapper dont le canvas n'a pas de Chart.js initialisé
    // → évite les grands rectangles blancs dans le PDF pour sections sans données
    const _hiddenChartWrappers = [];
    section.querySelectorAll('.chart-wrapper').forEach(wrapper => {
      const canvas = wrapper.querySelector('canvas');
      if (!canvas) return;
      const chart = (typeof Chart !== 'undefined') ? Chart.getChart(canvas) : null;
      if (!chart) {
        wrapper.dataset.pdfChartHidden = wrapper.style.display || '';
        wrapper.style.display = 'none';
        _hiddenChartWrappers.push(wrapper);
        // Si le chart-container parent n'a plus de wrappers visibles, le masquer aussi
        const container = wrapper.closest('.chart-container');
        if (container && !container.querySelector('.chart-wrapper:not([style*="display: none"]):not([style*="display:none"])')) {
          container.dataset.pdfChartHidden = container.style.display || '';
          container.style.display = 'none';
          _hiddenChartWrappers.push(container);
        }
      }
    });
    // Idem pour .chart-grid vides (tous enfants masqués)
    section.querySelectorAll('.chart-grid').forEach(grid => {
      const visibleChildren = Array.from(grid.children).filter(c =>
        c.style.display !== 'none' && !c.dataset.pdfChartHidden
      );
      if (visibleChildren.length === 0) {
        grid.dataset.pdfChartHidden = grid.style.display || '';
        grid.style.display = 'none';
        _hiddenChartWrappers.push(grid);
      }
    });

    // Estimation hauteur section via scrollHeight/scrollWidth (ratio DOM → PDF).
    // scrollHeight est fiable dans Grist contrairement à getBoundingClientRect.
    // On soustrait la hauteur du commentDiv (masqué) pour ne pas surestimer.
    const imgW = pageWidth - (2 * margin);
    const commentDivH = commentDiv ? (commentDiv.scrollHeight || 0) : 0;
    const sectionNetH = Math.max(0, (section.scrollHeight || 0) - commentDivH);
    const sectionW    = section.scrollWidth || 1;
    const estimatedH  = (sectionNetH / sectionW) * imgW * 1.15; // +15% marge Chart.js
    const fullPageH   = pageHeight - footerHeight - margin - (margin + headerHeight + 5);
    const availMm     = pageHeight - footerHeight - margin - yPosition;

    // Saut préventif si la section tient sur une page entière mais pas dans l'espace restant
    if (estimatedH > 10 && estimatedH <= fullPageH && availMm < estimatedH) {
      _pdfCtx.addPage();
    }

    // Capture de la section.
    // captureElementToImage mesure la hauteur réelle après rendu canvas :
    // - si ≤ une page : saut préventif si besoin, placement d'un bloc
    // - si > une page : slicing sur les enfants directs, groupant toujours
    //   les 2 premiers enfants (header + KPIs) ensemble
    await captureElementToImage(section);

    // Restaurer le div-commentaire
    if (commentDiv) {
      commentDiv.style.display = commentDiv.dataset.exportHidden || '';
      delete commentDiv.dataset.exportHidden;
    }

    // Restaurer les chart-wrapper masqués
    _hiddenChartWrappers.forEach(el => {
      el.style.display = el.dataset.pdfChartHidden || '';
      delete el.dataset.pdfChartHidden;
    });

    // Rendu natif du commentaire markdown
    if (mdValue && mdValue.trim()) {
      // Réinitialiser explicitement tous les états graphiques PDF après html2canvas
      pdf.setTextColor(50, 50, 50);
      pdf.setDrawColor(0, 83, 160);
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      _checkPageBreak(22);
      const imgWidth2 = pageWidth - (2 * margin);
      const blockX = margin;
      const blockW = imgWidth2;
      const innerX = blockX + 7; // texte décalé après la bordure gauche
      const innerW = blockW - 10;

      // ── Rendu du commentaire avec encadrement page-par-page ──
      // Principe : on dessine fond + bordure gauche au fil du rendu,
      // sans jamais naviguer en arrière (pas de setPage).
      // Le fond est dessiné APRÈS le texte sur chaque tranche de page.

      _checkPageBreak(16);

      // Label
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(80, 110, 160);
      pdf.text("Analyse de l'indicateur", innerX, yPosition + 3.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(30, 30, 40);
      yPosition = yPosition + 8;

      // Rendre le texte normalement via _pdfCtx (qui gère les sauts de page)
      _pdfCtx.y = yPosition;
      renderMarkdownToPDF(pdf, mdValue, innerX, _pdfCtx, innerW);
      yPosition = _pdfCtx.y + 3;
    }
    yPosition += 4;
  }

      // ── Restaurer tous les containers EasyMDE ─────────────────────────
  _mdeContainers.forEach(container => { container.style.display = ''; });
  
  addHeaderFooter(currentPage);
  _totalPages = currentPage;
  return currentPage;
}

function showLoadingMessage(message) {
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px 40px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:9999;text-align:center;font-family:Marianne,sans-serif;min-width:300px;';
  loadingDiv.innerHTML = `
    <div style="font-size:16px;font-weight:600;color:#002F6C;margin-bottom:10px;">Génération du PDF</div>
    <div style="font-size:13px;color:#666;">${message}</div>
  `;
  document.body.appendChild(loadingDiv);
  return loadingDiv;
}

function hideLoadingMessage(loadingDiv) {
  if (loadingDiv && loadingDiv.parentNode) {
    document.body.removeChild(loadingDiv);
  }
}

function exportToHTML() {
  const ficheBody = document.getElementById('fiche-body');
  const struct = FICHE_STATE.structure;
  const styleContent = document.querySelector('style').innerHTML;
  
  // ── Préparer le contenu pour l'export ──────────────────────────
  // 1. Convertir les éditeurs EasyMDE (Markdown) en HTML statique pour l'export
  const _mdeHtmlExportDivs = [];
  ficheBody.querySelectorAll('.EasyMDEContainer').forEach(container => {
    const ta = container.querySelector('textarea');
    const mdeId = ta ? ta.id : null;
    const mdValue = mdeId && _mdeInstances[mdeId] ? _mdeInstances[mdeId].value() : (ta ? ta.value : '');
    const div = document.createElement('div');
    div.className = 'md-render';
    div.style.cssText = 'font-family:Marianne,sans-serif;font-size:12px;line-height:1.55;color:var(--gris1);padding:10px 12px 10px 14px;border-left:3px solid var(--rep2);border-top:none;border-right:none;border-bottom:none;background:#f8f9fb;min-height:32px;margin-top:4px;';
    div.innerHTML = mdValue && mdValue.trim() ? mdToHtml(mdValue) : '<em style="color:var(--gris3);">Aucun commentaire.</em>';
    // Label institutionnel au-dessus du commentaire
    const labelDiv = document.createElement('div');
    labelDiv.className = 'md-render-label';
    labelDiv.style.cssText = 'font-family:Marianne,sans-serif;font-size:10px;font-style:italic;color:#506090;margin-top:8px;margin-bottom:2px;';
    labelDiv.textContent = "Analyse de l'indicateur";
    container.parentNode.insertBefore(labelDiv, container);
    container.parentNode.insertBefore(div, container);
    _mdeHtmlExportDivs.push({ div: labelDiv, container: null });
    container.style.display = 'none';
    _mdeHtmlExportDivs.push({ div, container });
  });
  
  // 2. Masquer les éléments interactifs non pertinents dans l'export
  const elementsToHide = ficheBody.querySelectorAll(
    '.comment-edit-btn, .comment-save-btn, .comment-cancel-btn, .pills-editor'
  );
  elementsToHide.forEach(el => el.setAttribute('data-export-hidden', el.style.display || ''));
  elementsToHide.forEach(el => el.style.display = 'none');
  
  // 3. S'assurer que la description synthèse et les pills sont visibles
  const commentDesc = ficheBody.querySelector('.comment-description');
  if (commentDesc) commentDesc.style.display = '';
  const pillsWrapper = ficheBody.querySelector('.comment-pills-wrapper');
  if (pillsWrapper) pillsWrapper.style.display = '';
  
  const ficheBodyHTML = ficheBody.innerHTML;
  
  // ── Restaurer l'état interactif ────────────────────────────────
  elementsToHide.forEach(el => {
    el.style.display = el.getAttribute('data-export-hidden') || '';
    el.removeAttribute('data-export-hidden');
  });
  // Restaurer les éditeurs EasyMDE (supprimer les divs de rendu statique)
  _mdeHtmlExportDivs.forEach(({ div, container }) => {
    div.remove();
    if (container) container.style.display = '';
  });
  
  const printStyles = `
    @media print {
      body { background: white; margin: 0; padding: 0; }
      .section, .kpi-card, .metrics-grid, .chart-container, .chart-grid,
      .comment-box, .fiche-header {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .data-table tbody tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      p, .kpi-card-details { orphans: 3; widows: 3; }
      .comment-edit-btn, .comment-save-btn, .comment-cancel-btn,
      .pills-editor, #selbar, #quick-nav { display: none !important; }
      textarea {
        border: none !important;
        resize: none !important;
        background: transparent !important;
        padding: 0 !important;
        pointer-events: none;
      }
      .md-render { font-size: 11px !important; }
      .md-render-label { font-size: 9px !important; }
    }
    @page { margin: 18mm 15mm; size: A4 portrait; }
    .comment-edit-btn, .comment-save-btn, .comment-cancel-btn,
    .pills-editor, #selbar, #quick-nav { display: none !important; }
    /* Style global md-render dans l'export statique */
    .md-render p { margin: 2px 0; }
    .md-render ul { margin: 2px 0; padding-left: 14px; }
    .md-render li { margin: 1px 0; }
    .md-render strong { color: var(--rep, #002F6C); }
    .md-render-label { display: block; }
  `;
  
  // Capturer les graphiques Chart.js en images base64 avant export
  const _chartImages = {};
  ficheBody.querySelectorAll('canvas').forEach(canvas => {
    if (canvas.id) {
      try { _chartImages[canvas.id] = canvas.toDataURL('image/png'); } catch(e) {}
    }
  });

  // Remplacer les canvas par des images dans le HTML exporté
  // (ficheBodyHTML est déjà capturé, on travaille sur une copie DOM temporaire)
  const _exportDoc = document.createElement('div');
  _exportDoc.innerHTML = ficheBodyHTML;
  _exportDoc.querySelectorAll('canvas').forEach(canvas => {
    if (canvas.id && _chartImages[canvas.id]) {
      const img = document.createElement('img');
      img.src = _chartImages[canvas.id];
      img.style.cssText = canvas.style.cssText || '';
      img.style.maxWidth = '100%';
      img.style.display = 'block';
      img.alt = canvas.id;
      canvas.parentNode.replaceChild(img, canvas);
    }
  });
  const ficheBodyHTMLWithCharts = _exportDoc.innerHTML;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fiche Identite \${struct.sigle} \${FICHE_STATE.annee}</title>
  <style>
    /* Responsive base */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #f5f6f8; }
    .export-wrapper {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px;
      background: white;
    }
    @media (max-width: 768px) {
      .export-wrapper { padding: 10px; }
      .metrics-grid, .kpi-grid { grid-template-columns: 1fr 1fr !important; }
      .chart-grid { grid-template-columns: 1fr !important; }
      .data-table { font-size: 11px; }
      .data-table th, .data-table td { padding: 4px 6px !important; }
      .kpi-card { padding: 8px !important; }
      .fiche-header { flex-direction: column; }
    }
    @media (max-width: 480px) {
      .metrics-grid, .kpi-grid { grid-template-columns: 1fr !important; }
      .data-table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    }
    img { max-width: 100%; height: auto; }
  </style>
  <style>${styleContent}${printStyles}</style>
</head>
<body>
  <div class="export-wrapper">
    ${ficheBodyHTMLWithCharts}
  </div>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${struct.sigle}-${FICHE_STATE.annee}-${getPDFTimestamp()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}


// ═══════════════════════════════════════════════════════════════
// EXPORT XLSX — Données chiffrées lisibles pour exploitation IA
// ═══════════════════════════════════════════════════════════════

function exportToXLSX() {
  if (typeof XLSX === 'undefined') {
    alert('Librairie SheetJS non chargee. Rechargez la page.');
    return;
  }
  const struct = FICHE_STATE.structure;
  const annee  = FICHE_STATE.annee;
  if (!struct) { alert('Aucune structure selectionnee.'); return; }
  const sid = struct.id;

  const wb = XLSX.utils.book_new();

  // ── Utilitaires ──────────────────────────────────────────────
  function t(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    const v = (el.innerText || el.textContent || '').trim()
      .replace(/\u00a0/g,' ').replace(/\u202f/g,' ');
    return (v==='—'||v==='-') ? '' : v;
  }

  function tableRowsFromDOM(tbodyId, headers) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return headers ? [headers] : [];
    const rows = headers ? [headers] : [];
    tbody.querySelectorAll('tr').forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('td,th')).map(td =>
        (td.innerText||'').trim().replace(/\u00a0/g,' ').replace(/\u202f/g,' ')
      );
      const cleaned = cells.map(c => (c==='—'||c==='') ? '' : c);
      if (cleaned.some(c=>c!=='')) rows.push(cleaned);
    });
    return rows;
  }

  function mdeVal(id) {
    if (_mdeInstances && _mdeInstances[id]) return _mdeInstances[id].value();
    const el = document.getElementById(id);
    return el ? (el.value||'') : '';
  }

  function addSheet(name, rows) {
    if (!rows||rows.length===0) return;
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const colW = rows[0] ? rows[0].map((_,ci) => ({
      wch: Math.min(80, Math.max(14, ...rows.map(r=>String(r[ci]||'').length)))
    })) : [];
    ws['!cols'] = colW;
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0,31));
  }

  function fmt(v) { return (v==null||v===0) ? '' : v; }
  function fmtEur(v) { return (v==null||v===0) ? '' : Math.round(v)+''; }
  function fmtPct(v) { return (v==null||v===0) ? '' : v.toFixed(1)+'%'; }

  // Périmètre de la structure
  const perimetre = getPerimetreFraisMission ? getPerimetreFraisMission(sid) : 'National';
  const libPer = getLibellePerimetreFraisMission ? getLibellePerimetreFraisMission(perimetre) : perimetre;

  // ── 1. Info ──────────────────────────────────────────────────
  addSheet('Info', [
    ['Champ','Valeur'],
    ['Sigle', struct.sigle||''],
    ['Nom', struct.nom||''],
    ['Type', struct.Type||struct.type_label||''],
    ['Region', struct.Region||struct.region||''],
    ['Annee de reference', annee],
    ['Perimetre de comparaison', libPer],
    ['Date export', new Date().toLocaleDateString('fr-FR')],
  ]);

  // ── 2. RH ────────────────────────────────────────────────────
  const rhAnnees = [annee-3, annee-2, annee-1, annee].filter(a=>a>2020);
  const rhRows = [
    ['Indicateur','Valeur '+annee,'vs '+(annee-1),'Comparaison perimetre','Comparaison national'],
    ['ETPT Total',   t('rh-effectif-total'), t('rh-effectif-evolution'), t('rh-effectif-compare'), t('rh-effectif-rang')],
    ['ETPT AGCO',    t('rh-agco-total'),     t('rh-agco-evolution'),     t('rh-agco-compare'),     ''],
    ['ETPT SU',      t('rh-su-total'),        t('rh-su-evolution'),        t('rh-su-compare'),        ''],
    ['Age moyen',    t('rh-age-moyen'),        '',                          t('rh-age-compare-groupe'),t('rh-age-compare-national')],
    ['MS / Agent',   t('rh-ms-par-agent'),     '',                          t('rh-ms-compare-groupe'), t('rh-ms-compare-national')],
  ];
  // Historique via getRHData (données brutes, pas le DOM)
  rhRows.push([]);
  rhRows.push(['Historique RH par annee']);
  rhRows.push(['Annee','ETPT Total','ETPT AGCO','ETPT SU','ETPT Autres','Masse Salariale (EUR)','MS / Agent (EUR)','Age moyen AGCO','Age moyen SU']);
  rhAnnees.forEach(a => {
    const d = typeof getRHData==='function' ? getRHData(sid, a) : null;
    if (d) {
      rhRows.push([
        a,
        fmt(d.effectif_total),
        fmt(d.effectif_agco),
        fmt(d.effectif_su),
        fmt(d.effectif_autres),
        fmtEur(d.masse_salariale),
        fmtEur(d.ms_par_agent),
        fmt(d.age_moyen_agco)||'',
        fmt(d.age_moyen_su)||'',
      ]);
    } else {
      rhRows.push([a,'','','','','','','','']);
    }
  });
  // Détail par structure (tableau DOM)
  const rhDetail = tableRowsFromDOM('rh-detail-tbody',
    ['Structure','ETPT Total','AGCO','SU','Autres','Masse Salariale (EUR)','MS/Agent (EUR)','Age Moyen']);
  if (rhDetail.length>1) { rhRows.push([]); rhDetail.forEach(r=>rhRows.push(r)); }
  addSheet('RH', rhRows);

  // ── 3. Budget ─────────────────────────────────────────────────
  // Récupérer les dates depuis les données sources
  const budgetD = typeof getBudgetData==='function' ? getBudgetData(sid, annee) : null;
  const comD    = typeof getCommunicationData==='function' ? getCommunicationData(sid) : null;
  const dateBudget = budgetD && budgetD.date_import ? budgetD.date_import.toLocaleDateString('fr-FR') : t('budget-date-import');
  const dateCom    = comD && comD.date_import ? comD.date_import.toLocaleDateString('fr-FR') : t('com-date-import');

  const budgetRows = [
    ['Indicateur','Valeur','Moyenne nationale'],
    ['Date des donnees', dateBudget, ''],
    ['Taux conso AE globale', t('budget-pill-taux-ae'), t('budget-pill-ae-national')],
    ['Taux conso CP globale', t('budget-pill-taux-cp'), t('budget-pill-cp-national')],
  ];
  const budgetTableEl = document.querySelector('.section:has(#budget-pill-taux-ae) .data-table');
  if (budgetTableEl) {
    budgetRows.push([]);
    budgetRows.push(['Execution budgetaire par categorie '+annee]);
    budgetRows.push(['Categorie','Dotation AE','Conso AE','Taux AE (%)','Dotation CP','Conso CP','Taux CP (%)','Moy. perimetre CP']);
    budgetTableEl.querySelectorAll('tbody tr').forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('td')).map(td=>(td.innerText||'').trim());
      if (cells.some(c=>c&&c!=='—')) budgetRows.push(cells.map(c=>c==='—'?'':c));
    });
  }
  addSheet('Budget', budgetRows);

  // ── 4. Communication ─────────────────────────────────────────
  const comRows = [
    ['Indicateur','Valeur','Comparaison'],
    ['Date des donnees', dateCom, ''],
    ['Conso vs cible 2026 (%)', t('com-sat-pct'), t('com-sat-label')],
    ['Reste disponible CP',     t('com-sat-reste'),''],
    ['vs National',             t('com-sat-vs-nat'),''],
    ['vs Perimetre',            t('com-sat-vs-per'),''],
  ];
  const comDetail = tableRowsFromDOM('table-com-body',
    ['Structure','CP 2022','CP 2023','CP 2024','CP 2025','Restes issus 2025','AE 2026','CP 2026','Cible 2026 (80% CP 2024)','Disponible AE','Disponible CP']);
  if (comDetail.length>1) { comRows.push([]); comDetail.forEach(r=>comRows.push(r)); }
  addSheet('Communication', comRows);

  // ── 5. Informatique ──────────────────────────────────────────
  const itRows = [
    ['Indicateur','Valeur '+annee,'Comparaison perimetre / national'],
    ['Postes de travail total', t('it-total'),               t('it-pct-portables')],
    ['Ratio poste / ETPT',      t('it-ratio'),               t('it-ratio-comp')],
    ['Budget IT annuel',         t('it-budget-annuel'),       t('it-budget-annuel-evol')],
    ['Budget IT moyen 4 ans',   t('it-budget-moyen'),         ''],
    ['Budget IT / ETPT',        t('it-budget-agent-annuel'), t('it-budget-agent-annuel-comp')],
    ['Budget IT / ETPT moy 4a', t('it-budget-agent-moyen'),  ''],
  ];
  const itDetail = tableRowsFromDOM('table-it-body',
    ['Annee','Portables','Fixes','Total postes','Ratio / ETPT','Budget IT (EUR)','Budget / ETPT (EUR)']);
  if (itDetail.length>1) { itRows.push([]); itRows.push(['Evolution 4 ans']); itDetail.forEach(r=>itRows.push(r)); }
  addSheet('Informatique', itRows);

  // ── 6. Frais de Mission ──────────────────────────────────────
  // KPIs depuis le DOM
  const fmRows = [
    ['Indicateur','Valeur '+annee,'Comparaison perimetre / national'],
    ['Total frais mission (EUR)',  t('fm-total-value'),     t('fm-total-comp')],
    ['Dont Formation (EUR)',       t('fm-formation-value'), t('fm-formation-pct')],
    ['Dont Autres missions (EUR)', t('fm-autres-value'),    t('fm-autres-pct')],
    ['Cout moyen / ETPT (EUR)',   t('fm-agent-value'),     t('fm-agent-comp')],
  ];
  // Données brutes multi-années via getFraisMissionMultiAnnees
  const fmAnnees = [annee-3, annee-2, annee-1, annee].filter(a=>a>2020);
  const fmMulti = typeof getFraisMissionMultiAnnees==='function'
    ? getFraisMissionMultiAnnees(sid, fmAnnees) : [];

  if (fmMulti.some(d=>d.montant_total)) {
    fmRows.push([]);
    fmRows.push(['Detail frais de mission par annee']);
    fmRows.push([
      'Annee','Type','Transport (EUR)','Hebergement (EUR)','Repas (EUR)','Total (EUR)',
      'dont Formation : Transport','dont Formation : Heberg.','dont Formation : Repas',
      'dont Autres : Transport','dont Autres : Heberg.','dont Autres : Repas',
      '% Formation','% Autres','Frais/Agent (EUR)'
    ]);
    fmMulti.forEach(d => {
      if (!d.montant_total && !d.total_transport) return;
      fmRows.push([
        d.annee, 'Total',
        fmtEur(d.total_transport), fmtEur(d.total_hebergement), fmtEur(d.total_repas), fmtEur(d.montant_total),
        fmtEur(d.formation_transport), fmtEur(d.formation_hebergement), fmtEur(d.formation_repas),
        fmtEur(d.autres_transport), fmtEur(d.autres_hebergement), fmtEur(d.autres_repas),
        fmtPct(d.pct_formation), fmtPct(d.pct_autres), fmtEur(d.frais_par_agent),
      ]);
    });

    // Moyennes périmètre et national
    fmRows.push([]);
    fmRows.push(['Moyennes de comparaison (annee '+annee+')']);
    fmRows.push(['Perimetre','Moy frais/structure (EUR)','Moy frais/agent (EUR)','Moy formation/agent (EUR)','Moy autres/agent (EUR)']);
    const fmMoyPer = typeof getFraisMissionMoyennes==='function' ? getFraisMissionMoyennes(perimetre, annee) : null;
    const fmMoyNat = typeof getFraisMissionMoyennes==='function' ? getFraisMissionMoyennes('National', annee) : null;
    if (fmMoyPer) fmRows.push([libPer, fmtEur(fmMoyPer.moy_frais_par_structure), fmtEur(fmMoyPer.moy_frais_par_agent), fmtEur(fmMoyPer.moy_formation_par_agent), fmtEur(fmMoyPer.moy_autres_par_agent)]);
    if (fmMoyNat) fmRows.push(['National', fmtEur(fmMoyNat.moy_frais_par_structure), fmtEur(fmMoyNat.moy_frais_par_agent), fmtEur(fmMoyNat.moy_formation_par_agent), fmtEur(fmMoyNat.moy_autres_par_agent)]);
  } else {
    // Fallback DOM
    const fmDetail = tableRowsFromDOM('table-fm-body', null);
    if (fmDetail.length) {
      fmRows.push([]);
      fmRows.push(['Annee','Type','Transport (EUR)','Hebergement (EUR)','Repas (EUR)','Total (EUR)']);
      let curAn = '';
      fmDetail.forEach(cells => {
        const first = cells[0]||'';
        if (/^\d{4}$/.test(first)) { curAn=first; fmRows.push([first,'',cells[1]||'',cells[2]||'',cells[3]||'',cells[4]||'']); }
        else { fmRows.push([curAn, first, cells[1]||'',cells[2]||'',cells[3]||'',cells[4]||'']); }
      });
    }
  }
  addSheet('Frais_Mission', fmRows);

  // ── 7. Fonctionnement ────────────────────────────────────────
  const fd = typeof getFonctionnementData==='function' ? getFonctionnementData(sid) : null;
  const fonctRows = [
    ['Indicateur','Valeur '+annee,'Comparaison perimetre / national'],
    ['Part depenses maitrisables % CP (2025)', fd ? fmtPct(fd.pct_m_2025) : '', t('fonct-pill-agent-2025-detail')],
    ['Depenses maitrisables / ETPT (2025)',    fd ? fmtEur(fd.fonct_agent_2025) : '', t('fonct-pill-agent-2025-detail')],
    ['Depenses maitrisables / ETPT (moy 4a)', fd ? fmtEur(fd.fonct_agent_4ans) : '', t('fonct-pill-agent-4ans-detail')],
    ['Evolution part maitrisable 4 ans (pts)', fd ? fd.evol_pct_maitrisable?.toFixed(1)||'' : '', ''],
  ];
  if (fd) {
    fonctRows.push([]);
    fonctRows.push(['Historique fonctionnement courant']);
    fonctRows.push(['Annee','CP total (EUR)','CP maitrisable (EUR)','% maitrisable','Fonct/Agent (EUR)']);
    [[2022,fd.cp_2022,fd.cp_2022_m,fd.pct_m_2022,fd.fonct_agent_2022],
     [2023,fd.cp_2023,fd.cp_2023_m,fd.pct_m_2023,fd.fonct_agent_2023],
     [2024,fd.cp_2024,fd.cp_2024_m,fd.pct_m_2024,fd.fonct_agent_2024],
     [2025,fd.cp_2025,fd.cp_2025_m,fd.pct_m_2025,fd.fonct_agent_2025],
    ].forEach(([a,cp,cpm,pct,agent]) => {
      fonctRows.push([a, fmtEur(cp), fmtEur(cpm), pct?pct.toFixed(1)+'%':'', fmtEur(agent)]);
    });
    // Moyennes
    const fonctPerim = typeof getFonctPerimetre==='function' ? getFonctPerimetre(sid) : perimetre;
    const consoNat = typeof getConsolidationData==='function' ? getConsolidationData('National', annee) : null;
    const consoPer = typeof getConsolidationData==='function' ? getConsolidationData(fonctPerim, annee) : null;
    if (consoNat || consoPer) {
      fonctRows.push([]);
      fonctRows.push(['Moyennes de comparaison']);
      fonctRows.push(['Perimetre','Moy. fonct/agent (EUR)','Moy. fonct/agent 4a (EUR)','Moy. % maitrisable']);
      if (consoPer) fonctRows.push([libPer, fmtEur(consoPer.moy_fonct_par_agent), fmtEur(consoPer.moy_fonct_par_agent_4ans), fmtPct(consoPer.moy_pct_maitrisable)]);
      if (consoNat) fonctRows.push(['National', fmtEur(consoNat.moy_fonct_par_agent), fmtEur(consoNat.moy_fonct_par_agent_4ans), fmtPct(consoNat.moy_pct_maitrisable)]);
    }
  }
  addSheet('Fonctionnement', fonctRows);

  // ── 8. Parc Automobile ───────────────────────────────────────
  const vehRows = [
    ['Indicateur','Valeur','Comparaison perimetre / national'],
    ['Total vehicules',        t('veh-total-value'),    t('veh-total-comp')],
    ['Budget total (EUR)',      t('veh-budget-value'),   t('veh-budget-comp')],
    ['Vehicule / ETPT',        t('veh-ratio-value'),    t('veh-ratio-comp')],
    ['Cout fonct. / vehicule', t('veh-cout-value'),     t('veh-cout-comp')],
    ['Ratio vehicule / SU',    t('veh-ratio-su-value'), t('veh-ratio-su-comp')],
  ];
  const vehDetail = tableRowsFromDOM('table-veh-body',
    ['Annee','Total','Vetustes','% Vetuste','Fonct. (EUR)','Invest. (EUR)','Total Budget (EUR)','Ratio/ETPT']);
  if (vehDetail.length>1) { vehRows.push([]); vehRows.push(['Historique parc automobile']); vehDetail.forEach(r=>vehRows.push(r)); }
  addSheet('Parc_Automobile', vehRows);

  // ── 9. Immobilier ────────────────────────────────────────────
  const immoRows = [
    ['Indicateur','Valeur','Comparaison perimetre / national'],
    ['Surface SUB totale (m2)',            t('immo-sub-value'),   t('immo-sites-detail')],
    ['Ratio occupation (m2/res)',           t('immo-ratio-value'), t('immo-ratio-comp')],
    ['Cout surfacique '+annee+' (EUR/m2)', t('immo-cout-value'),  t('immo-cout-comp')],
    ['Evolution cout surfacique',          '',                     t('immo-cout-evol')],
    ['Cout surfacique moyen 4a (EUR/m2)', t('immo-cout-moyen'),  ''],
  ];
  const immoPublic = tableRowsFromDOM('table-immo-public-body',
    ['Libelle','Ville','Type','SUB (m2)','Residents','Ratio occ. (m2/res.)','Energie (EUR)','Cout surf. (EUR/m2)']);
  if (immoPublic.length>1) {
    immoRows.push([]); immoRows.push(['Domaine public / mise a disposition']);
    immoPublic.forEach(r=>immoRows.push(r));
  }
  const immoPriv = tableRowsFromDOM('table-immo-prive-body',
    ['Libelle','Ville','Type','SUB (m2)','Residents','Ratio occ. (m2/res.)','Energie (EUR)','Cout surf. (EUR/m2)','Fin de bail','Loyer annuel (EUR)','Loyer/m2 (EUR)']);
  if (immoPriv.length>1) {
    immoRows.push([]); immoRows.push(['Baux prives']);
    immoPriv.forEach(r=>immoRows.push(r));
  }
  addSheet('Immobilier', immoRows);

  // ── 10. Commentaires ─────────────────────────────────────────
  // Vue d'ensemble : lire depuis _mdeInstances ou getCommentaire
  const syntheseVal = (_mdeInstances && _mdeInstances['synthese-mde-textarea'])
    ? _mdeInstances['synthese-mde-textarea'].value()
    : (typeof getCommentaire==='function'
       ? (getCommentaire(sid, annee, 'Synthese') || '') : '');

  const cmtRows = [['Section','Texte (Markdown)']];
  [
    ["Vue d'ensemble", syntheseVal],
    ['Budget',          mdeVal('budget-commentaire')],
    ['Communication',   mdeVal('com-commentaire')],
    ['RH',              mdeVal('rh-commentaire')],
    ['Informatique',    mdeVal('it-commentaire')],
    ['Frais de Mission',mdeVal('fm-commentaire')],
    ['Fonctionnement',  mdeVal('fonct-commentaire')],
    ['Parc Automobile', mdeVal('veh-commentaire')],
    ['Immobilier',      mdeVal('immo-commentaire')],
  ].forEach(([sec, val]) => cmtRows.push([sec, val||'']));
  addSheet('Commentaires', cmtRows);

  // ── Télécharger ───────────────────────────────────────────────
  XLSX.writeFile(wb, `${struct.sigle}-${annee}-${getPDFTimestamp()}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT XLSX — MODAL + MULTI-STRUCTURES
// ═══════════════════════════════════════════════════════════════

function showXLSXModal() {
  const existing = document.getElementById('xlsx-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'xlsx-modal';
  modal.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.5);z-index:10000;
    display:flex;align-items:center;justify-content:center;
    font-family:'Marianne',sans-serif;
  `;

  const struct = FICHE_STATE.structure;
  const structName = struct ? (struct.sigle || struct.nom) : '—';

  modal.innerHTML = `
    <div style="background:white;border-radius:12px;width:500px;max-width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.3);overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1B5E20,#2E7D32);padding:24px;color:white;">
        <h2 style="margin:0;font-size:20px;font-weight:700;">📊 Exporter en XLSX</h2>
        <p style="margin:8px 0 0 0;font-size:13px;opacity:0.9;">Données chiffrées pour exploitation IA</p>
      </div>
      <div style="padding:24px;">
        <div style="margin-bottom:20px;">
          <label style="display:block;font-weight:600;color:#1E2D3D;margin-bottom:12px;font-size:14px;">📄 Mode d'export</label>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label style="display:flex;align-items:center;padding:12px;border:2px solid #E6ECF8;border-radius:8px;cursor:pointer;" class="xlsx-option" data-mode="single">
              <input type="radio" name="xlsx-mode" value="single" checked style="margin-right:12px;width:18px;height:18px;">
              <div>
                <div style="font-weight:600;color:#1B5E20;font-size:14px;">Structure actuelle</div>
                <div style="font-size:12px;color:#6c757d;margin-top:2px;">Exporter uniquement <strong>${structName}</strong></div>
              </div>
            </label>
            <label style="display:flex;align-items:center;padding:12px;border:2px solid #E6ECF8;border-radius:8px;cursor:pointer;" class="xlsx-option" data-mode="zip">
              <input type="radio" name="xlsx-mode" value="zip" style="margin-right:12px;width:18px;height:18px;">
              <div>
                <div style="font-weight:600;color:#1B5E20;font-size:14px;">Archive ZIP — un XLSX par structure</div>
                <div style="font-size:12px;color:#6c757d;margin-top:2px;">Génère un fichier XLSX par structure dans une archive ZIP</div>
              </div>
            </label>

          </div>
        </div>

        <div id="xlsx-filter-section" style="margin-bottom:20px;display:none;">
          <label style="display:block;font-weight:600;color:#1E2D3D;margin-bottom:12px;font-size:14px;">🔍 Filtrer les structures</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <label style="display:flex;align-items:center;padding:8px 12px;background:#f8f9fa;border-radius:6px;cursor:pointer;font-size:13px;">
              <input type="checkbox" class="xlsx-filter-type" value="DG" checked style="margin-right:8px;">
              <span style="background:#6c757d;color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;margin-right:6px;">DG</span>Direction Générale
            </label>
            <label style="display:flex;align-items:center;padding:8px 12px;background:#f8f9fa;border-radius:6px;cursor:pointer;font-size:13px;">
              <input type="checkbox" class="xlsx-filter-type" value="DI" checked style="margin-right:8px;">
              <span style="background:#0053a0;color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;margin-right:6px;">DI</span>Directions interrégionales métropole
            </label>
            <label style="display:flex;align-items:center;padding:8px 12px;background:#f8f9fa;border-radius:6px;cursor:pointer;font-size:13px;">
              <input type="checkbox" class="xlsx-filter-type" value="DI Outremer" checked style="margin-right:8px;">
              <span style="background:#17a2b8;color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;margin-right:6px;">DI OM</span>Directions interrégionales outremer
            </label>
            <label style="display:flex;align-items:center;padding:8px 12px;background:#f8f9fa;border-radius:6px;cursor:pointer;font-size:13px;">
              <input type="checkbox" class="xlsx-filter-type" value="DR Metropole" style="margin-right:8px;">
              <span style="background:#6f42c1;color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;margin-right:6px;">DR</span>Directions régionales métropole
            </label>
            <label style="display:flex;align-items:center;padding:8px 12px;background:#f8f9fa;border-radius:6px;cursor:pointer;font-size:13px;">
              <input type="checkbox" class="xlsx-filter-type" value="DR Outremer" checked style="margin-right:8px;">
              <span style="background:#fd7e14;color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;margin-right:6px;">DR OM</span>Directions régionales outremer
            </label>
            <label style="display:flex;align-items:center;padding:8px 12px;background:#f8f9fa;border-radius:6px;cursor:pointer;font-size:13px;">
              <input type="checkbox" class="xlsx-filter-type" value="SCN" checked style="margin-right:8px;">
              <span style="background:#28a745;color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;margin-right:6px;">SCN</span>Services à compétence nationale
            </label>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button id="xlsx-cancel" style="padding:10px 20px;border:1px solid #ddd;border-radius:8px;background:white;cursor:pointer;font-size:14px;">Annuler</button>
          <button id="xlsx-confirm" style="padding:10px 24px;border:none;border-radius:8px;background:#2E7D32;color:white;font-weight:600;cursor:pointer;font-size:14px;">Exporter</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Surligner l'option sélectionnée
  modal.querySelectorAll('.xlsx-option').forEach(opt => {
    opt.addEventListener('click', () => {
      modal.querySelectorAll('.xlsx-option').forEach(o => o.style.borderColor = '#E6ECF8');
      opt.style.borderColor = '#2E7D32';
      const mode = opt.dataset.mode;
      const fs = document.getElementById('xlsx-filter-section');
      if (fs) fs.style.display = (mode === 'zip') ? 'block' : 'none';
    });
  });
  // Surligner la première option par défaut
  modal.querySelector('.xlsx-option[data-mode="single"]').style.borderColor = '#2E7D32';

  document.getElementById('xlsx-cancel').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  document.getElementById('xlsx-confirm').onclick = async () => {
    const mode = modal.querySelector('input[name="xlsx-mode"]:checked').value;
    const selectedTypes = Array.from(modal.querySelectorAll('.xlsx-filter-type:checked')).map(c => c.value);
    const filters = { types: selectedTypes };
    modal.remove();
    await executeXLSXExport(mode, filters);
  };
}

async function executeXLSXExport(mode, filters) {
  if (mode === 'single') {
    exportToXLSX(); // fonction existante — structure courante
    return;
  }

  if (typeof XLSX === 'undefined') {
    alert('Librairie SheetJS non chargee. Rechargez la page.');
    return;
  }
  if (typeof JSZip === 'undefined' && mode === 'zip') {
    alert('JSZip non disponible.');
    return;
  }

  let structures = getStructuresArray();
  if (filters && filters.types && filters.types.length > 0) {
    structures = filterStructuresByTypes(structures, filters.types);
  }
  if (structures.length === 0) { alert('Aucune structure correspondant aux filtres.'); return; }

  const annee = FICHE_STATE.annee;
  const loadingDiv = showLoadingMessage(`Génération XLSX pour ${structures.length} structures...`);

  try {
    if (mode === 'zip') {
      // ── Un XLSX par structure → ZIP ─────────────────────────
      const zip = new JSZip();
      for (let i = 0; i < structures.length; i++) {
        const s = structures[i];
        if (loadingDiv) loadingDiv.querySelector('div:last-child').textContent =
          `XLSX ${i+1}/${structures.length} : ${s.sigle}`;

        await selectStructure(s.id);
        await new Promise(r => setTimeout(r, 500));

        // Générer le workbook pour cette structure via exportToXLSXWorkbook()
        const wb = exportToXLSXWorkbook(s, annee);
        const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        zip.file(`${s.sigle}-${annee}-${getPDFTimestamp()}.xlsx`, xlsxData);
      }
      if (loadingDiv) loadingDiv.querySelector('div:last-child').textContent = 'Compression...';
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiches-identite-xlsx-${annee}-${getPDFTimestamp()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      hideLoadingMessage(loadingDiv);
      alert(`Archive ZIP générée : ${structures.length} fichiers XLSX.`);

    } else if (mode === 'global') {
      // ── Un seul XLSX, un onglet "résumé" + un onglet RH_KPI, etc. ──
      // Structure : onglet "Structures" avec toutes les KPIs en lignes
      const wb = XLSX.utils.book_new();

      // Onglet récapitulatif — une ligne par structure, colonnes = KPIs principaux
      const summaryHeaders = [
        'Sigle','Nom','Type','Region',
        'ETPT Total','ETPT AGCO','ETPT SU','Age Moyen','MS/Agent (EUR)',
        'Budget AE Taux (%)','Budget CP Taux (%)',
        'IT Postes','IT Budget (EUR)','IT Ratio/ETPT',
        'FM Total (EUR)','FM/Agent (EUR)',
        'Fonct CP 2025 (EUR)','Fonct % Maitrisable','Fonct/Agent (EUR)',
        'Veh Total','Veh Budget (EUR)',
        'Immo SUB (m2)','Immo Cout surf. (EUR/m2)',
      ];
      const summaryRows = [summaryHeaders];

      for (let i = 0; i < structures.length; i++) {
        const s = structures[i];
        if (loadingDiv) loadingDiv.querySelector('div:last-child').textContent =
          `Collecte ${i+1}/${structures.length} : ${s.sigle}`;

        await selectStructure(s.id);
        await new Promise(r => setTimeout(r, 400));

        const sid = s.id;
        const rhD = typeof getRHData==='function' ? getRHData(sid, annee) : null;
        const fmD = typeof getFraisMissionData==='function' ? getFraisMissionData(sid, annee) : null;
        const fonctD = typeof getFonctionnementData==='function' ? getFonctionnementData(sid) : null;

        const tv = id => { const el=document.getElementById(id); if(!el) return ''; const v=(el.innerText||'').trim().replace(/\u00a0/g,' '); return (v==='—'||v==='-')?'':v; };

        summaryRows.push([
          s.sigle||'', s.nom||'', s.Type||'', s.Region||'',
          rhD ? (rhD.effectif_total||'') : '',
          rhD ? (rhD.effectif_agco||'') : '',
          rhD ? (rhD.effectif_su||'') : '',
          rhD ? (rhD.age_moyen_agco||'') : '',
          rhD ? (Math.round(rhD.ms_par_agent)||'') : '',
          tv('budget-pill-taux-ae'), tv('budget-pill-taux-cp'),
          tv('it-total'), tv('it-budget-annuel'), tv('it-ratio'),
          fmD ? (Math.round(fmD.montant_total)||'') : '',
          fmD ? (Math.round(fmD.frais_par_agent)||'') : '',
          fonctD ? (Math.round(fonctD.cp_2025)||'') : '',
          fonctD ? (fonctD.pct_m_2025?.toFixed(1)||'') : '',
          fonctD ? (Math.round(fonctD.fonct_agent_2025)||'') : '',
          tv('veh-total-value'), tv('veh-budget-value'),
          tv('immo-sub-value'), tv('immo-cout-value'),
        ]);
      }
      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const colW = summaryHeaders.map((_,ci) => ({
        wch: Math.min(30, Math.max(12, ...summaryRows.map(r=>String(r[ci]||'').length)))
      }));
      ws['!cols'] = colW;
      XLSX.utils.book_append_sheet(wb, ws, 'Synthese_'+annee);

      // Onglet Commentaires globaux
      const cmtHeaders = ['Sigle','Nom','Section','Texte (Markdown)'];
      const cmtRows = [cmtHeaders];
      for (let i = 0; i < structures.length; i++) {
        const s = structures[i];
        await selectStructure(s.id);
        await new Promise(r => setTimeout(r, 300));
        const sections = [
          ["Vue d'ensemble", 'synthese-mde-textarea'],
          ['RH',             'rh-commentaire'],
          ['Budget',         'budget-commentaire'],
          ['Informatique',   'it-commentaire'],
          ['FM',             'fm-commentaire'],
          ['Fonctionnement', 'fonct-commentaire'],
          ['Vehicules',      'veh-commentaire'],
          ['Immobilier',     'immo-commentaire'],
        ];
        sections.forEach(([sec, id]) => {
          const val = (_mdeInstances && _mdeInstances[id]) ? _mdeInstances[id].value()
            : (document.getElementById(id) ? document.getElementById(id).value||'' : '');
          if (val) cmtRows.push([s.sigle, s.nom, sec, val]);
        });
      }
      const wsCmt = XLSX.utils.aoa_to_sheet(cmtRows);
      wsCmt['!cols'] = [{wch:10},{wch:30},{wch:18},{wch:80}];
      XLSX.utils.book_append_sheet(wb, wsCmt, 'Commentaires');

      XLSX.writeFile(wb, `synthese-structures-${annee}-${getPDFTimestamp()}.xlsx`);
      hideLoadingMessage(loadingDiv);
      alert(`XLSX global généré : ${structures.length} structures.`);
    }

  } catch (err) {
    hideLoadingMessage(loadingDiv);
    alert('Erreur export XLSX : ' + (err && err.message ? err.message : String(err)));
    console.error(err);
  }
}

/**
 * Génère un workbook XLSX pour une structure (réutilise la logique de exportToXLSX)
 * sans déclencher le téléchargement — retourne le workbook.
 */
function exportToXLSXWorkbook(struct, annee) {
  const wb = XLSX.utils.book_new();
  const sid = struct.id;

  function t(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    const v = (el.innerText||el.textContent||'').trim().replace(/\u00a0/g,' ').replace(/\u202f/g,' ');
    return (v==='—'||v==='-') ? '' : v;
  }
  function tableRowsFromDOM(tbodyId, headers) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return headers ? [headers] : [];
    const rows = headers ? [headers] : [];
    tbody.querySelectorAll('tr').forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('td,th')).map(td =>
        (td.innerText||'').trim().replace(/\u00a0/g,' ').replace(/\u202f/g,' ')
      );
      const cleaned = cells.map(c => (c==='—'||c==='') ? '' : c);
      if (cleaned.some(c=>c!=='')) rows.push(cleaned);
    });
    return rows;
  }
  function mdeVal(id) {
    if (_mdeInstances && _mdeInstances[id]) return _mdeInstances[id].value();
    const el = document.getElementById(id);
    return el ? (el.value||'') : '';
  }
  function addSheet(name, rows) {
    if (!rows||rows.length===0) return;
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const colW = rows[0] ? rows[0].map((_,ci) => ({
      wch: Math.min(80, Math.max(14, ...rows.map(r=>String(r[ci]||'').length)))
    })) : [];
    ws['!cols'] = colW;
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0,31));
  }
  function fmtEur(v) { return (v==null||v===0)?'':Math.round(v)+''; }
  function fmtPct(v) { return (v==null||v===0)?'':v.toFixed(1)+'%'; }
  function fmt(v) { return (v==null||v===0)?'':v; }

  const perimetre = typeof getPerimetreFraisMission==='function' ? getPerimetreFraisMission(sid) : 'National';
  const libPer = typeof getLibellePerimetreFraisMission==='function' ? getLibellePerimetreFraisMission(perimetre) : perimetre;

  addSheet('Info', [
    ['Champ','Valeur'],
    ['Sigle', struct.sigle||''],
    ['Nom', struct.nom||''],
    ['Type', struct.Type||struct.type_label||''],
    ['Region', struct.Region||struct.region||''],
    ['Annee de reference', annee],
    ['Perimetre', libPer],
    ['Date export', new Date().toLocaleDateString('fr-FR')],
  ]);

  const rhAnnees = [annee-3,annee-2,annee-1,annee].filter(a=>a>2020);
  const rhRows = [
    ['Indicateur','Valeur '+annee,'vs '+(annee-1),'Comparaison perimetre','Comparaison national'],
    ['ETPT Total',  t('rh-effectif-total'), t('rh-effectif-evolution'), t('rh-effectif-compare'), t('rh-effectif-rang')],
    ['ETPT AGCO',   t('rh-agco-total'),     t('rh-agco-evolution'),     t('rh-agco-compare'),     ''],
    ['ETPT SU',     t('rh-su-total'),        t('rh-su-evolution'),        t('rh-su-compare'),        ''],
    ['Age moyen',   t('rh-age-moyen'),        '',                          t('rh-age-compare-groupe'),t('rh-age-compare-national')],
    ['MS / Agent',  t('rh-ms-par-agent'),     '',                          t('rh-ms-compare-groupe'), t('rh-ms-compare-national')],
  ];
  rhRows.push([]); rhRows.push(['Historique RH']);
  rhRows.push(['Annee','ETPT Total','ETPT AGCO','ETPT SU','ETPT Autres','Masse Salariale (EUR)','MS/Agent (EUR)','Age moyen AGCO','Age moyen SU']);
  rhAnnees.forEach(a => {
    const d = typeof getRHData==='function' ? getRHData(sid,a) : null;
    rhRows.push(d ? [a,fmt(d.effectif_total),fmt(d.effectif_agco),fmt(d.effectif_su),fmt(d.effectif_autres),fmtEur(d.masse_salariale),fmtEur(d.ms_par_agent),fmt(d.age_moyen_agco),fmt(d.age_moyen_su)] : [a,'','','','','','','','']);
  });
  const rhDetail = tableRowsFromDOM('rh-detail-tbody',['Structure','ETPT Total','AGCO','SU','Autres','MS (EUR)','MS/Agent (EUR)','Age Moyen']);
  if (rhDetail.length>1) { rhRows.push([]); rhDetail.forEach(r=>rhRows.push(r)); }
  addSheet('RH', rhRows);

  const budgetD = typeof getBudgetData==='function' ? getBudgetData(sid, annee) : null;
  const comD    = typeof getCommunicationData==='function' ? getCommunicationData(sid) : null;
  const dateBudget = budgetD && budgetD.date_import ? budgetD.date_import.toLocaleDateString('fr-FR') : t('budget-date-import');
  const dateCom    = comD && comD.date_import ? comD.date_import.toLocaleDateString('fr-FR') : t('com-date-import');

  const budgetRows = [
    ['Indicateur','Valeur','Moyenne nationale'],
    ['Date des donnees', dateBudget, ''],
    ['Taux conso AE globale', t('budget-pill-taux-ae'), t('budget-pill-ae-national')],
    ['Taux conso CP globale', t('budget-pill-taux-cp'), t('budget-pill-cp-national')],
  ];
  const budgetEl = document.querySelector('.section:has(#budget-pill-taux-ae) .data-table');
  if (budgetEl) {
    budgetRows.push([]); budgetRows.push(['Categorie','Dotation AE','Conso AE','Taux AE (%)','Dotation CP','Conso CP','Taux CP (%)','Moy. perimetre CP']);
    budgetEl.querySelectorAll('tbody tr').forEach(tr => {
      const c = Array.from(tr.querySelectorAll('td')).map(td=>(td.innerText||'').trim());
      if (c.some(x=>x&&x!=='—')) budgetRows.push(c.map(x=>x==='—'?'':x));
    });
  }
  addSheet('Budget', budgetRows);

  // ── Communication (manquait dans workbook) ───────────────────
  const comRowsWB = [
    ['Indicateur','Valeur','Comparaison'],
    ['Date des donnees', dateCom, ''],
    ['Conso vs cible 2026 (%)', t('com-sat-pct'), t('com-sat-label')],
    ['Reste disponible CP',     t('com-sat-reste'),''],
    ['vs National',             t('com-sat-vs-nat'),''],
    ['vs Perimetre',            t('com-sat-vs-per'),''],
  ];
  const comDetailWB = tableRowsFromDOM('table-com-body',
    ['Structure','CP 2022','CP 2023','CP 2024','CP 2025','Restes issus 2025','AE 2026','CP 2026','Cible 2026 (80% CP 2024)','Disponible AE','Disponible CP']);
  if (comDetailWB.length>1) { comRowsWB.push([]); comDetailWB.forEach(r=>comRowsWB.push(r)); }
  addSheet('Communication', comRowsWB);

  const itRows = [
    ['Indicateur','Valeur '+annee,'Comparaison'],
    ['Postes total',       t('it-total'),               t('it-pct-portables')],
    ['Ratio poste/ETPT',   t('it-ratio'),               t('it-ratio-comp')],
    ['Budget IT',          t('it-budget-annuel'),        t('it-budget-annuel-evol')],
    ['Budget IT moy 4a',   t('it-budget-moyen'),         ''],
    ['Budget IT/ETPT',     t('it-budget-agent-annuel'), t('it-budget-agent-annuel-comp')],
    ['Budget IT/ETPT 4a',  t('it-budget-agent-moyen'),  ''],
  ];
  const itD = tableRowsFromDOM('table-it-body',['Annee','Portables','Fixes','Total','Ratio/ETPT','Budget IT (EUR)','Budget/ETPT (EUR)']);
  if (itD.length>1) { itRows.push([]); itD.forEach(r=>itRows.push(r)); }
  addSheet('Informatique', itRows);

  const fmRows = [
    ['Indicateur','Valeur '+annee,'Comparaison'],
    ['Total FM (EUR)',     t('fm-total-value'),     t('fm-total-comp')],
    ['Formation (EUR)',    t('fm-formation-value'), t('fm-formation-pct')],
    ['Autres (EUR)',       t('fm-autres-value'),    t('fm-autres-pct')],
    ['FM/Agent (EUR)',    t('fm-agent-value'),     t('fm-agent-comp')],
  ];
  const fmAnnees = [annee-3,annee-2,annee-1,annee].filter(a=>a>2020);
  const fmMulti = typeof getFraisMissionMultiAnnees==='function' ? getFraisMissionMultiAnnees(sid,fmAnnees) : [];
  if (fmMulti.some(d=>d.montant_total)) {
    fmRows.push([]); fmRows.push(['Annee','Total (EUR)','Transport (EUR)','Hebergement (EUR)','Repas (EUR)','FM Transport','FM Heberg','FM Repas','Autres Transport','Autres Heberg','Autres Repas','% Form','% Autres','FM/Agent (EUR)']);
    fmMulti.forEach(d => {
      if (!d.montant_total&&!d.total_transport) return;
      fmRows.push([d.annee,fmtEur(d.montant_total),fmtEur(d.total_transport),fmtEur(d.total_hebergement),fmtEur(d.total_repas),fmtEur(d.formation_transport),fmtEur(d.formation_hebergement),fmtEur(d.formation_repas),fmtEur(d.autres_transport),fmtEur(d.autres_hebergement),fmtEur(d.autres_repas),fmtPct(d.pct_formation),fmtPct(d.pct_autres),fmtEur(d.frais_par_agent)]);
    });
  }
  addSheet('Frais_Mission', fmRows);

  const fd = typeof getFonctionnementData==='function' ? getFonctionnementData(sid) : null;
  const fonctRows = [
    ['Indicateur','Valeur','Comparaison'],
    ['% maitrisable 2025',     fd?fmtPct(fd.pct_m_2025):'',         t('fonct-pill-agent-2025-detail')],
    ['Fonct/Agent 2025 (EUR)', fd?fmtEur(fd.fonct_agent_2025):'',    t('fonct-pill-agent-2025-detail')],
    ['Fonct/Agent moy 4a',     fd?fmtEur(fd.fonct_agent_4ans):'',    t('fonct-pill-agent-4ans-detail')],
    ['Evol % maitrisable',     fd?fd.evol_pct_maitrisable?.toFixed(1)||'':'',''],
  ];
  if (fd) {
    fonctRows.push([]); fonctRows.push(['Annee','CP total (EUR)','CP maitrisable (EUR)','% maitrisable','Fonct/Agent (EUR)']);
    [[2022,fd.cp_2022,fd.cp_2022_m,fd.pct_m_2022,fd.fonct_agent_2022],[2023,fd.cp_2023,fd.cp_2023_m,fd.pct_m_2023,fd.fonct_agent_2023],[2024,fd.cp_2024,fd.cp_2024_m,fd.pct_m_2024,fd.fonct_agent_2024],[2025,fd.cp_2025,fd.cp_2025_m,fd.pct_m_2025,fd.fonct_agent_2025]].forEach(([a,cp,cpm,pct,ag])=>fonctRows.push([a,fmtEur(cp),fmtEur(cpm),pct?pct.toFixed(1)+'%':'',fmtEur(ag)]));
  }
  addSheet('Fonctionnement', fonctRows);

  const vehRows = [
    ['Indicateur','Valeur','Comparaison'],
    ['Total',           t('veh-total-value'),    t('veh-total-comp')],
    ['Budget (EUR)',    t('veh-budget-value'),   t('veh-budget-comp')],
    ['Veh/ETPT',       t('veh-ratio-value'),    t('veh-ratio-comp')],
    ['Cout fonct/veh', t('veh-cout-value'),     t('veh-cout-comp')],
    ['Ratio veh/SU',   t('veh-ratio-su-value'), t('veh-ratio-su-comp')],
  ];
  const vehD = tableRowsFromDOM('table-veh-body',['Annee','Total','Vetustes','% Vetuste','Fonct (EUR)','Invest (EUR)','Budget Total (EUR)','Ratio/ETPT']);
  if (vehD.length>1) { vehRows.push([]); vehD.forEach(r=>vehRows.push(r)); }
  addSheet('Parc_Automobile', vehRows);

  const immoRows = [
    ['Indicateur','Valeur','Comparaison'],
    ['SUB totale (m2)',         t('immo-sub-value'),   t('immo-sites-detail')],
    ['Ratio occ (m2/res)',      t('immo-ratio-value'), t('immo-ratio-comp')],
    ['Cout surf (EUR/m2)',      t('immo-cout-value'),  t('immo-cout-comp')],
    ['Evol cout surf',          '',                    t('immo-cout-evol')],
    ['Cout surf moy 4a (EUR/m2)',t('immo-cout-moyen'), ''],
  ];
  const ip = tableRowsFromDOM('table-immo-public-body',['Libelle','Ville','Type','SUB (m2)','Residents','Ratio occ','Energie (EUR)','Cout surf (EUR/m2)']);
  if (ip.length>1) { immoRows.push([]); immoRows.push(['Domaine public']); ip.forEach(r=>immoRows.push(r)); }
  const iv = tableRowsFromDOM('table-immo-prive-body',['Libelle','Ville','Type','SUB (m2)','Residents','Ratio occ','Energie (EUR)','Cout surf (EUR/m2)','Fin de bail','Loyer annuel (EUR)','Loyer/m2 (EUR)']);
  if (iv.length>1) { immoRows.push([]); immoRows.push(['Baux prives']); iv.forEach(r=>immoRows.push(r)); }
  addSheet('Immobilier', immoRows);

  const syntheseVal = (_mdeInstances&&_mdeInstances['synthese-mde-textarea']) ? _mdeInstances['synthese-mde-textarea'].value()
    : (typeof getCommentaire==='function' ? (getCommentaire(sid,annee,'Synthese')||'') : '');
  const cmtRows = [['Section','Texte (Markdown)']];
  [["Vue d'ensemble",syntheseVal],['Budget',mdeVal('budget-commentaire')],['Communication',mdeVal('com-commentaire')],['RH',mdeVal('rh-commentaire')],['Informatique',mdeVal('it-commentaire')],['Frais de Mission',mdeVal('fm-commentaire')],['Fonctionnement',mdeVal('fonct-commentaire')],['Parc Automobile',mdeVal('veh-commentaire')],['Immobilier',mdeVal('immo-commentaire')]].forEach(([s,v])=>cmtRows.push([s,v||'']));
  addSheet('Commentaires', cmtRows);

  return wb;
}


// ═══════════════════════════════════════════════════════════════
// EXPORT APPLICATION MOBILE — PWA standalone consultable hors-ligne
// ═══════════════════════════════════════════════════════════════

function exportToMobileApp() {
  const struct = FICHE_STATE.structure;
  const annee  = FICHE_STATE.annee;
  if (!struct) { alert('Aucune structure sélectionnée.'); return; }

  // ── 1. Capturer les graphiques Chart.js en images base64 ──────
  const ficheBody = document.getElementById('fiche-body');
  const _chartImages = {};
  ficheBody.querySelectorAll('canvas').forEach(canvas => {
    if (canvas.id) {
      try { _chartImages[canvas.id] = canvas.toDataURL('image/png'); } catch(e) {}
    }
  });

  // ── 2. Lire les commentaires EasyMDE ──────────────────────────
  function getMdeValue(id) {
    if (window._mdeInstances && _mdeInstances[id]) return _mdeInstances[id].value();
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  // ── 3. Collecter les données de chaque section ─────────────────
  function elText(id) {
    const el = document.getElementById(id);
    return el ? (el.innerText || el.textContent || '').trim() : '—';
  }

  // Synthèse (vue d'ensemble)
  const syntheseMd = getMdeValue('synthese-mde-textarea') || (typeof getCommentaire === 'function' ? (getCommentaire(struct.id, annee, 'Synthese') || '') : '');

  // Sections avec leurs données
  const sections = [
    {
      id: 'rh',
      icon: '👥',
      title: 'Ressources Humaines',
      color: '#1A6B3C',
      chartId: 'rh-chart',
      commentId: 'rh-commentaire',
      kpis: [
        { label: 'Effectif total', valueId: 'rh-effectif-total', compId: 'rh-effectif-compare' },
        { label: 'AGCO', valueId: 'rh-agco-total', compId: 'rh-agco-compare' },
        { label: 'Surveillance', valueId: 'rh-su-total', compId: null },
        { label: 'Âge moyen', valueId: 'rh-age-moyen', compId: 'rh-age-compare-groupe' },
        { label: 'MS / agent', valueId: 'rh-ms-par-agent', compId: null },
      ],
    },
    {
      id: 'informatique',
      icon: '💻',
      title: 'Informatique',
      color: '#1351A8',
      chartId: 'it-chart',
      commentId: 'it-commentaire',
      kpis: [
        { label: 'Postes', valueId: 'it-total', compId: null },
        { label: 'Budget IT CP', valueId: 'it-budget-annuel', compId: null },
        { label: 'Ratio poste/agent', valueId: 'it-ratio', compId: 'it-ratio-comp' },
        { label: 'Budget / agent', valueId: 'it-budget-agent-annuel', compId: null },
      ],
    },
    {
      id: 'frais_mission',
      icon: '✈️',
      title: 'Frais de Mission',
      color: '#8A6800',
      chartId: 'fm-chart',
      commentId: 'fm-commentaire',
      kpis: [
        { label: 'Total dépenses', valueId: 'fm-total-value', compId: null },
        { label: 'Formation', valueId: 'fm-formation-value', compId: 'fm-formation-pct' },
        { label: 'Autres FM', valueId: 'fm-autres-value', compId: 'fm-autres-pct' },
        { label: 'FM / agent', valueId: 'fm-agent-value', compId: null },
      ],
    },
    {
      id: 'fonctionnement',
      icon: '🏢',
      title: 'Fonctionnement courant',
      color: '#C05A00',
      chartId: 'fonct-chart',
      commentId: 'fonct-commentaire',
      kpis: [
        { label: 'CP maîtrisable', valueId: 'fonct-pill-pct-m', compId: 'fonct-pill-pct-m-detail' },
        { label: 'CP / agent', valueId: 'fonct-pill-agent-2025', compId: 'fonct-pill-agent-2025-detail' },
        { label: 'Lissé 4 ans / agent', valueId: 'fonct-pill-agent-4ans', compId: 'fonct-pill-agent-4ans-detail' },
      ],
    },
    {
      id: 'vehicules',
      icon: '🚗',
      title: 'Parc Automobile',
      color: '#4A5A6A',
      chartId: 'veh-chart',
      commentId: 'veh-commentaire',
      kpis: [
        { label: 'Véhicules total', valueId: 'veh-total-value', compId: null },
        { label: 'Budget véhicules', valueId: 'veh-budget-value', compId: null },
        { label: 'Ratio veh/100 agents', valueId: 'veh-ratio-value', compId: null },
        { label: 'Ratio veh/SU', valueId: 'veh-ratio-su-value', compId: null },
      ],
    },
    {
      id: 'immobilier',
      icon: '🏛️',
      title: 'Immobilier',
      color: '#5C4080',
      chartId: 'immo-chart',
      commentId: 'immo-commentaire',
      kpis: [
        { label: 'SUB totale', valueId: 'immo-sub-value', compId: 'immo-sites-detail' },
        { label: 'Ratio m²/rés.', valueId: 'immo-ratio-value', compId: 'immo-ratio-comp' },
        { label: 'Coût surf.', valueId: 'immo-cout-value', compId: 'immo-cout-comp' },
        { label: 'Coût surf. lissé', valueId: 'immo-cout-moyen', compId: null },
      ],
    },
    {
      id: 'communication',
      icon: '📣',
      title: 'Communication',
      color: '#B52020',
      chartId: 'com-chart',
      commentId: 'com-commentaire',
      kpis: [
        { label: 'CP 2026', valueId: 'com-pill-cp-val', compId: null },
        { label: 'Cible', valueId: 'com-pill-cible-val', compId: null },
        { label: 'Disponible', valueId: 'com-pill-cap-cp-val', compId: null },
        { label: 'Taux conso', valueId: 'com-sat-pct', compId: 'com-sat-label' },
      ],
    },
  ];

  // ── 4. Construire le HTML de chaque section ────────────────────
  function buildKpiCards(kpis) {
    return kpis.map(k => {
      const val = elText(k.valueId);
      const comp = k.compId ? elText(k.compId) : '';
      return `<div class="kpi-mob">
        <div class="kpi-mob-label">${k.label}</div>
        <div class="kpi-mob-value">${val !== '' ? val : '—'}</div>
        ${comp ? `<div class="kpi-mob-comp">${comp}</div>` : ''}
      </div>`;
    }).join('');
  }

  function buildSectionContent(s) {
    const chartImg = _chartImages[s.chartId]
      ? `<div class="mob-chart-wrap"><img src="${_chartImages[s.chartId]}" alt="Graphique ${s.title}" loading="lazy"></div>`
      : '';
    const mdRaw = getMdeValue(s.commentId) || '';
    const mdHtml = mdRaw.trim() ? mdToHtml(mdRaw) : '<em style="color:#8A9BAA;">Aucun commentaire.</em>';
    return `
      <div class="kpi-mob-grid">${buildKpiCards(s.kpis)}</div>
      ${chartImg}
      <div class="mob-comment-block">
        <div class="mob-comment-label">Analyse de l'indicateur</div>
        <div class="md-render mob-md">${mdHtml}</div>
      </div>`;
  }

  // ── 5. Vue d'ensemble ──────────────────────────────────────────
  const synHtml = syntheseMd.trim() ? mdToHtml(syntheseMd) : '<em style="color:#8A9BAA;">Aucun commentaire.</em>';
  const rhData = sections.find(s => s.id === 'rh');
  const overviewContent = `
    <div class="mob-overview-header">
      <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Logo_des_Douanes_Fran%C3%A7aises.svg" alt="Douanes" class="mob-logo">
      <div>
        <div class="mob-sigle">${struct.sigle || ''}</div>
        <div class="mob-nom">${struct.nom || ''}</div>
        <div class="mob-type">${struct.type || ''} · ${annee}</div>
      </div>
    </div>
    ${elText('header-region') !== '—' ? `<div class="mob-meta-row"><span class="mob-meta-icon">📍</span><span>${elText('header-region')}</span></div>` : ''}
    ${elText('header-responsable') !== '—' ? `<div class="mob-meta-row"><span class="mob-meta-icon">👤</span><span>${elText('header-responsable')}</span></div>` : ''}
    <div class="mob-comment-block" style="margin-top:16px;">
      <div class="mob-comment-label">Synthèse</div>
      <div class="md-render mob-md">${synHtml}</div>
    </div>
    <div class="mob-section-shortcut-title">Indicateurs</div>
    <div class="mob-shortcuts">
      ${sections.map((s,i) => `<button class="mob-shortcut" style="border-color:${s.color};color:${s.color};" onclick="switchTab(${i+1})">${s.icon} ${s.title}</button>`).join('')}
    </div>`;

  // ── 6. Assembler les tabs ──────────────────────────────────────
  const allTabs = [
    { id: 'overview', icon: '🏠', label: 'Accueil', content: overviewContent },
    ...sections.map(s => ({
      id: s.id,
      icon: s.icon,
      label: s.title.length > 10 ? s.title.split(' ')[0] : s.title,
      color: s.color,
      content: buildSectionContent(s),
      title: s.title,
    })),
  ];

  const tabButtons = allTabs.map((t, i) =>
    `<button class="mob-tab${i===0?' active':''}" id="taббtn-${i}" onclick="switchTab(${i})" title="${t.label || t.title || ''}">
      <span class="mob-tab-icon">${t.icon}</span>
      <span class="mob-tab-label">${t.label}</span>
    </button>`
  ).join('');

  const tabPanels = allTabs.map((t, i) =>
    `<div class="mob-panel${i===0?' active':''}" id="panel-${i}">
      ${i > 0 ? `<div class="mob-panel-title" style="border-color:${t.color||'#002F6C'};color:${t.color||'#002F6C'};">${t.icon} ${t.title || t.label}</div>` : ''}
      ${t.content}
    </div>`
  ).join('');

  // ── 7. Générer le fichier HTML complet ─────────────────────────
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#002F6C">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${struct.sigle} ${annee}">
  <title>Fiche ${struct.sigle} ${annee}</title>
  <style>
    :root {
      --rep: #002F6C;
      --rep2: #1351A8;
      --rep-pale: #E6ECF8;
      --gris1: #1E2D3D;
      --gris2: #4A5A6A;
      --gris3: #8A9BAA;
      --gris4: #EEF2F7;
      --bord: #CDD6E4;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; background: #f0f2f7; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 14px;
      color: var(--gris1);
      display: flex;
      flex-direction: column;
    }

    /* ── Top bar ── */
    .mob-topbar {
      background: var(--rep);
      color: white;
      padding: 10px 14px env(safe-area-inset-top, 0px) 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      min-height: 52px;
    }
    .mob-topbar-logo { width: 28px; height: 28px; object-fit: contain; filter: brightness(0) invert(1); }
    .mob-topbar-text { flex: 1; overflow: hidden; }
    .mob-topbar-sigle { font-weight: 700; font-size: 15px; line-height: 1.2; }
    .mob-topbar-sub { font-size: 11px; opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ── Contenu scrollable ── */
    .mob-content {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }

    /* ── Panels ── */
    .mob-panel { display: none; padding: 16px 14px 90px 14px; animation: fadein .18s ease; }
    .mob-panel.active { display: block; }
    @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .mob-panel-title {
      font-size: 16px;
      font-weight: 700;
      border-left: 4px solid var(--rep);
      padding-left: 10px;
      margin-bottom: 14px;
    }

    /* ── Vue d'ensemble ── */
    .mob-overview-header {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--rep);
      color: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .mob-logo { width: 48px; height: 48px; object-fit: contain; filter: brightness(0) invert(1); flex-shrink: 0; }
    .mob-sigle { font-size: 22px; font-weight: 800; line-height: 1.1; }
    .mob-nom { font-size: 13px; opacity: 0.85; margin-top: 2px; }
    .mob-type { font-size: 11px; opacity: 0.65; margin-top: 4px; }
    .mob-meta-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gris2); padding: 5px 0; border-bottom: 1px solid var(--bord); }
    .mob-meta-icon { font-size: 15px; width: 20px; text-align: center; }
    .mob-section-shortcut-title { font-weight: 700; font-size: 13px; color: var(--gris2); text-transform: uppercase; letter-spacing: .5px; margin: 18px 0 10px 0; }
    .mob-shortcuts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .mob-shortcut {
      background: white;
      border: 2px solid;
      border-radius: 10px;
      padding: 10px 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      line-height: 1.3;
    }
    .mob-shortcut:active { opacity: 0.7; transform: scale(0.97); }

    /* ── KPI Cards ── */
    .kpi-mob-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .kpi-mob {
      background: white;
      border-radius: 10px;
      padding: 12px;
      border-left: 3px solid var(--rep);
      box-shadow: 0 1px 4px rgba(0,47,108,.08);
    }
    .kpi-mob-label { font-size: 10px; color: var(--gris3); text-transform: uppercase; letter-spacing: .4px; font-weight: 600; margin-bottom: 4px; }
    .kpi-mob-value { font-size: 18px; font-weight: 700; color: var(--gris1); line-height: 1.2; }
    .kpi-mob-comp { font-size: 10px; color: var(--gris3); margin-top: 3px; }

    /* ── Chart ── */
    .mob-chart-wrap { background: white; border-radius: 12px; padding: 12px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,47,108,.08); }
    .mob-chart-wrap img { width: 100%; height: auto; display: block; border-radius: 6px; }

    /* ── Commentaires ── */
    .mob-comment-block { background: white; border-radius: 12px; padding: 14px; box-shadow: 0 1px 4px rgba(0,47,108,.08); }
    .mob-comment-label { font-size: 10px; font-style: italic; color: #506090; margin-bottom: 8px; }
    .mob-md { font-size: 13px; line-height: 1.6; color: var(--gris1); }
    .mob-md p { margin: 4px 0; }
    .mob-md ul, .mob-md ol { padding-left: 18px; margin: 4px 0; }
    .mob-md li { margin: 2px 0; }
    .mob-md strong { color: var(--rep); }
    .mob-md em { color: var(--gris2); }

    /* ── Bottom nav ── */
    .mob-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid var(--bord);
      display: flex;
      padding-bottom: env(safe-area-inset-bottom, 0px);
      z-index: 100;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .mob-bottom-nav::-webkit-scrollbar { display: none; }
    .mob-tab {
      flex: 0 0 auto;
      min-width: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 6px 6px 6px;
      border: none;
      background: transparent;
      color: var(--gris3);
      cursor: pointer;
      transition: color .15s;
      font-family: inherit;
    }
    .mob-tab.active { color: var(--rep); }
    .mob-tab.active .mob-tab-icon { transform: translateY(-2px); }
    .mob-tab-icon { font-size: 20px; line-height: 1; transition: transform .15s; }
    .mob-tab-label { font-size: 9px; margin-top: 3px; font-weight: 500; white-space: nowrap; }

    /* ── Indicateur actif coloré ── */
    ${sections.map((s, i) => `.mob-tab[data-idx="${i+1}"].active { color: ${s.color}; }`).join('\n    ')}

    /* ── Scrollbar styles ── */
    .mob-content::-webkit-scrollbar { width: 3px; }
    .mob-content::-webkit-scrollbar-thumb { background: var(--bord); border-radius: 3px; }
  </style>
</head>
<body>

  <div class="mob-topbar">
    <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Logo_des_Douanes_Fran%C3%A7aises.svg" alt="Douanes" class="mob-topbar-logo">
    <div class="mob-topbar-text">
      <div class="mob-topbar-sigle">${struct.sigle} — ${annee}</div>
      <div class="mob-topbar-sub">${struct.nom}</div>
    </div>
  </div>

  <div class="mob-content" id="mob-content">
    ${tabPanels}
  </div>

  <nav class="mob-bottom-nav" id="mob-nav">
    ${tabButtons}
  </nav>

  <script>
    function switchTab(idx) {
      document.querySelectorAll('.mob-panel').forEach((p,i) => p.classList.toggle('active', i===idx));
      document.querySelectorAll('.mob-tab').forEach((b,i) => b.classList.toggle('active', i===idx));
      // Scroll contenu en haut
      document.getElementById('mob-content').scrollTop = 0;
      // Scroll nav pour centrer le tab actif
      const nav = document.getElementById('mob-nav');
      const btn = nav.querySelectorAll('.mob-tab')[idx];
      if (btn) {
        const btnCenter = btn.offsetLeft + btn.offsetWidth / 2;
        nav.scrollLeft = btnCenter - nav.clientWidth / 2;
      }
    }
    // Initialiser les data-idx pour la coloration
    document.querySelectorAll('.mob-tab').forEach((b,i) => b.setAttribute('data-idx', i));
  </script>

</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `${struct.sigle}-${annee}-mobile-${getPDFTimestamp()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
