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
    notif_bop: null,
    consolidation: null,
	consolidation_structure: null,
    commentaires: null
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
        budget_it_par_agent_4ans: consolStruct.IT_Par_Agent_Lisse?.[i] || 0
      };
    }
  }
  return null;
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
    const [structures, rh, vehicules, frais_mission, informatique, communication, fonctionnement, notif_bop, consolidation, consolidation_structure, commentaires, infbud40] = await Promise.all([
      grist.docApi.fetchTable('Structures'),
      grist.docApi.fetchTable('RH'),
      grist.docApi.fetchTable('Vehicules'),
      grist.docApi.fetchTable('Frais_Mission'),
      grist.docApi.fetchTable('Informatique'),
      grist.docApi.fetchTable('Communication').catch(() => null),
      grist.docApi.fetchTable('Fonctionnement').catch(() => null),
      grist.docApi.fetchTable('Notif_BOP'),
      grist.docApi.fetchTable('Consolidation'),
	  grist.docApi.fetchTable('Consolidation_Structure'),
      grist.docApi.fetchTable('Commentaires'),
      grist.docApi.fetchTable('INFBUD40_2')
    ]);
    
    FICHE_STATE.data.structures = structures;
    FICHE_STATE.data.rh = rh;
    FICHE_STATE.data.vehicules = vehicules;
    FICHE_STATE.data.frais_mission = frais_mission;
    FICHE_STATE.data.informatique = informatique;
    FICHE_STATE.data.communication = communication;
    FICHE_STATE.data.fonctionnement = fonctionnement;
    FICHE_STATE.data.notif_bop = notif_bop;
    FICHE_STATE.data.consolidation = consolidation;
	FICHE_STATE.data.consolidation_structure = consolidation_structure;
    FICHE_STATE.data.commentaires = commentaires;
    FICHE_STATE.data.infbud40 = infbud40;
    
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



function getBudgetData(structureId, annee) {
  const notif = FICHE_STATE.data.notif_bop;
  const results = {};
  
  // Récupérer toutes les lignes pour cette structure/année
  notif.id.forEach((id, i) => {
    if (notif.Structure[i] === structureId && notif.Annee[i] === annee) {
      const type = notif.Type[i];
      results[type] = {
        notif_ae: notif.Notif_AE[i] || 0,
        notif_cp: notif.Notif_CP[i] || 0,
        conso_ae: notif.Conso_AE[i] || 0,
        conso_cp: notif.Conso_CP[i] || 0,
        taux_conso_ae: notif.Taux_Conso_AE[i] || 0,
        taux_conso_cp: notif.Taux_Conso_CP[i] || 0,
        reste_ae: notif.Reste_AE[i] || 0,
        reste_cp: notif.Reste_CP[i] || 0
      };
    }
  });
  
  return results;
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
          title: { display: true, text: 'Effectifs' }
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
  });
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
/**
 * MODULE BUDGET - FICHE IDENTITÉ DGDDI
 * Gestion des données budgétaires INFBUD40
 */

// ═══════════════════════════════════════════════════════════════
// RÉCUPÉRATION DONNÉES BUDGET
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les données budgétaires pour une structure et une année
 * @param {number} structureId - ID de la structure
 * @param {number} annee - Année
 * @returns {Object} Données budgétaires agrégées par mois
 */
function getBudgetDataInfbud(structureId, annee) {
  const infbud = FICHE_STATE.data.infbud40;
  const structures = FICHE_STATE.data.structures;
  
  if (!infbud || !structures) return null;
  
  // Trouver la structure
  const structIdx = structures.id.indexOf(structureId);
  if (structIdx === -1) return null;
  
  const structType = structures.Type[structIdx];
  const structHIE = structures.HIE[structIdx];
  
  // Liste des structures à agréger
  let structuresToAggregate = [structureId];
  
  // Si DI, ajouter les DR rattachées
  if (structType === 'DI') {
    structures.id.forEach((id, i) => {
      if (structures.Type[i] === 'DR' && structures.Parent[i] === structureId) {
        structuresToAggregate.push(id);
      }
    });
  }
  
  // Agréger les données par mois
  const dataByMonth = {};
  
  infbud.id.forEach((id, idx) => {
    const budgetAnnee = infbud.Annee[idx];
    const budgetStructId = infbud.Structure[idx];
    
    if (budgetAnnee !== annee) return;
    if (!structuresToAggregate.includes(budgetStructId)) return;
    
    const moisNum = infbud.Mois_Numero[idx];
    if (!moisNum || moisNum === 0) return;
    
    if (!dataByMonth[moisNum]) {
      dataByMonth[moisNum] = {
        mois_numero: moisNum,
        mois_nom: infbud.Mois[idx],
        ae: 0,
        cp: 0
      };
    }
    
    dataByMonth[moisNum].ae += infbud.AE[idx] || 0;
    dataByMonth[moisNum].cp += infbud.CP[idx] || 0;
  });
  
  return dataByMonth;
}

/**
 * Récupère les notifications BOP pour une structure et une année
 */
function getNotificationsBOP(structureId, annee) {
  const notifBop = FICHE_STATE.data.notif_bop;
  const structures = FICHE_STATE.data.structures;
  
  if (!notifBop || !structures) return null;
  
  // Liste des structures à agréger
  const structIdx = structures.id.indexOf(structureId);
  if (structIdx === -1) return null;
  
  const structType = structures.Type[structIdx];
  let structuresToAggregate = [structureId];
  
  if (structType === 'DI') {
    structures.id.forEach((id, i) => {
      if (structures.Type[i] === 'DR' && structures.Parent[i] === structureId) {
        structuresToAggregate.push(id);
      }
    });
  }
  
  let totalAE = 0;
  let totalCP = 0;
  
  notifBop.id.forEach((id, idx) => {
    if (notifBop.Annee[idx] !== annee) return;
    if (notifBop.Type[idx] !== 'Total') return;
    if (!structuresToAggregate.includes(notifBop.Structure[idx])) return;
    
    totalAE += notifBop.Notif_AE[idx] || 0;
    totalCP += notifBop.Notif_CP[idx] || 0;
  });
  
  return { ae: totalAE, cp: totalCP };
}

/**
 * Calcule le dernier mois disponible pour une année
 */
function getDernierMoisDispo(structureId, annee) {
  const data = getBudgetDataInfbud(structureId, annee);
  if (!data) return 0;
  
  const mois = Object.keys(data).map(m => parseInt(m)).sort((a, b) => b - a);
  return mois.length > 0 ? mois[0] : 0;
}

/**
 * Récupère les taux de consommation pour comparaison
 */
function getTauxConsoComparaison(type, annee) {
  const infbud = FICHE_STATE.data.infbud40;
  const structures = FICHE_STATE.data.structures;
  const notifBop = FICHE_STATE.data.notif_bop;
  
  if (!infbud || !structures || !notifBop) return null;
  
  // Structures du type demandé
  const structIds = structures.id.filter((id, i) => structures.Type[i] === type);
  
  let totalConsoAE = 0;
  let totalConsoCP = 0;
  let totalNotifAE = 0;
  let totalNotifCP = 0;
  
  // Agréger consommations
  infbud.id.forEach((id, idx) => {
    if (infbud.Annee[idx] !== annee) return;
    if (!structIds.includes(infbud.Structure[idx])) return;
    
    totalConsoAE += infbud.AE[idx] || 0;
    totalConsoCP += infbud.CP[idx] || 0;
  });
  
  // Agréger notifications
  notifBop.id.forEach((id, idx) => {
    if (notifBop.Annee[idx] !== annee) return;
    if (notifBop.Type[idx] !== 'Total') return;
    if (!structIds.includes(notifBop.Structure[idx])) return;
    
    totalNotifAE += notifBop.Notif_AE[idx] || 0;
    totalNotifCP += notifBop.Notif_CP[idx] || 0;
  });
  
  return {
    taux_ae: totalNotifAE > 0 ? (totalConsoAE / totalNotifAE * 100) : 0,
    taux_cp: totalNotifCP > 0 ? (totalConsoCP / totalNotifCP * 100) : 0
  };
}

/**
 * Récupère les données budgétaires pour une structure, une année ET un type
 */
function getBudgetDataInfbudByType(structureId, annee, type) {
  const infbud = FICHE_STATE.data.infbud40;
  const structures = FICHE_STATE.data.structures;
  
  if (!infbud || !structures) return null;
  
  const structIdx = structures.id.indexOf(structureId);
  if (structIdx === -1) return null;
  
  const structType = structures.Type[structIdx];
  let structuresToAggregate = [structureId];
  
  if (structType === 'DI') {
    structures.id.forEach((id, i) => {
      if (structures.Type[i] === 'DR' && structures.Parent[i] === structureId) {
        structuresToAggregate.push(id);
      }
    });
  }
  
  const dataByMonth = {};
  
  infbud.id.forEach((id, idx) => {
    const budgetAnnee = infbud.Annee[idx];
    const budgetStructId = infbud.Structure[idx];
    const budgetType = infbud.Type[idx];
    
    if (budgetAnnee !== annee) return;
    if (!structuresToAggregate.includes(budgetStructId)) return;
    if (budgetType !== type) return;
    
    const moisNum = infbud.Mois_Numero[idx];
    if (!moisNum || moisNum === 0) return;
    
    if (!dataByMonth[moisNum]) {
      dataByMonth[moisNum] = {
        mois_numero: moisNum,
        mois_nom: infbud.Mois[idx],
        ae: 0,
        cp: 0
      };
    }
    
    dataByMonth[moisNum].ae += infbud.AE[idx] || 0;
    dataByMonth[moisNum].cp += infbud.CP[idx] || 0;
  });
  
  return dataByMonth;
}

/**
 * Récupère les notifications BOP pour une structure, une année ET un type
 */
function getNotificationsBOPByType(structureId, annee, type) {
  const notifBop = FICHE_STATE.data.notif_bop;
  const structures = FICHE_STATE.data.structures;
  
  if (!notifBop || !structures) return null;
  
  const structIdx = structures.id.indexOf(structureId);
  if (structIdx === -1) return null;
  
  const structType = structures.Type[structIdx];
  let structuresToAggregate = [structureId];
  
  if (structType === 'DI') {
    structures.id.forEach((id, i) => {
      if (structures.Type[i] === 'DR' && structures.Parent[i] === structureId) {
        structuresToAggregate.push(id);
      }
    });
  }
  
  let totalAE = 0;
  let totalCP = 0;
  
  notifBop.id.forEach((id, idx) => {
    if (notifBop.Annee[idx] !== annee) return;
    if (notifBop.Type[idx] !== type) return;
    if (!structuresToAggregate.includes(notifBop.Structure[idx])) return;
    
    totalAE += notifBop.Notif_AE[idx] || 0;
    totalCP += notifBop.Notif_CP[idx] || 0;
  });
  
  return { ae: totalAE, cp: totalCP };
}

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
    
    document.getElementById('veh-vetuste-value').textContent = '—';
    document.getElementById('veh-vetuste-evol').innerHTML = '';
    document.getElementById('veh-vetuste-comp').innerHTML = '';
    
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
  
  // 2. Taux de Vétusté
  document.getElementById('veh-vetuste-value').textContent = formatPercent(data.taux_vetuste);
  
  // Évolution taux vétusté
  if (dataN1) {
    const evolVetuste = data.taux_vetuste - dataN1.taux_vetuste;
    document.getElementById('veh-vetuste-evol').innerHTML = `
      <span style="color:${evolVetuste <= 0 ? '#10b981' : '#ef4444'};">
        ${evolVetuste >= 0 ? '▲' : '▼'} ${Math.abs(evolVetuste).toFixed(1)}pp
      </span>
      <span style="margin-left:6px;color:var(--gris2);font-size:10px;">vs ${annee - 1}</span>
    `;
  } else {
    document.getElementById('veh-vetuste-evol').textContent = '';
  }
  
  // Pas de comparaison vs périmètre pour le taux de vétusté
  document.getElementById('veh-vetuste-comp').textContent = '';
  
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
  
  // 6. Ratio véhicule / SU
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
  
  // Ajouter ligne moyenne du périmètre
  if (perimetre) {
    const rowMoy = document.createElement('tr');
    rowMoy.style.borderTop = '1px solid var(--bord)';
    rowMoy.style.background = 'var(--gris5)';
    rowMoy.style.fontWeight = '500';
    
    const consolDerniere = getConsolidationData(perimetre, annees[annees.length - 1]);
    
    if (consolDerniere) {
      rowMoy.innerHTML = `
        <td style="padding:12px 16px;font-size:13px;">Moyenne ${perimetre}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(consolDerniere.moy_nb_vehicules || 0, 0)}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">—</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatPercent(consolDerniere.moy_taux_vetuste || 0)}</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">—</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">—</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber((consolDerniere.moy_budget_vehicules || 0) / 1000, 0)} K€</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${formatNumber(consolDerniere.moy_ratio_vehicule_agent || 0, 3)}</td>
      `;
      
      tbody.appendChild(rowMoy);
    }
  }
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
function buildFonctComparison(val, moyNat, moyPer, inverser) {
  if (!val) return '';
  let html = '';

  [
    { moy: moyNat, label: '🌍 National' },
    { moy: moyPer, label: '📍 Périmètre' }
  ].forEach(({ moy, label }) => {
    if (!moy) return;
    const diff = ((val - moy) / moy) * 100;
    const absDiff = Math.abs(diff);
    if (absDiff < 1) {
      html += `<div style="font-size:10px;color:var(--gris3);">${label} : données similaires</div>`;
      return;
    }
    const enHaut = diff > 0;
    const mauvais = inverser ? enHaut : !enHaut;
    const color = mauvais ? 'var(--rouge)' : 'var(--vert)';
    const sign = enHaut ? '+' : '';
    html += `<div style="font-size:10px;color:${color};">${label} : ${sign}${absDiff.toFixed(1)} %</div>`;
  });

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

  // ── PILL 1 : Évolution CP total 2022→2025 ────────────────────
  // Pas de comparaison : c'est une évolution propre à la structure
  const pill1 = document.getElementById('fonct-pill-evol');
  if (pill1) {
    const evol = d.evol_cp_4ans;
    const sign  = evol >= 0 ? '+' : '';
    const color = evol > 5 ? 'var(--rouge)' : evol < -5 ? 'var(--vert)' : 'var(--gris2)';
    pill1.innerHTML = `<span style="font-size:22px;font-weight:700;color:${color};">${sign}${evol.toFixed(1)} %</span>`;
    const det = document.getElementById('fonct-pill-evol-detail');
    if (det) det.innerHTML =
      `<div style="font-size:11px;color:var(--gris3);">${formatFonctMontant(d.cp_2022)} → ${formatFonctMontant(d.cp_2025)}</div>`;
  }

  // ── PILL 2 : Part maîtrisable 2025 + comparaison ─────────────
  const pill2 = document.getElementById('fonct-pill-pct-m');
  if (pill2) {
    const pct   = d.pct_m_2025;
    const evol  = d.evol_pct_maitrisable;
    const sign  = evol >= 0 ? '+' : '';
    const colorEvol = evol > 2 ? 'var(--rouge)' : evol < -2 ? 'var(--vert)' : 'var(--gris3)';
    pill2.innerHTML = `<span style="font-size:22px;font-weight:700;color:var(--rep);">${pct.toFixed(1)} %</span>`;
    const det = document.getElementById('fonct-pill-pct-m-detail');
    if (det) {
      const evolHtml = `<div style="font-size:10px;color:${colorEvol};">Évolution : ${sign}${evol.toFixed(1)} pt (2022→2025)</div>`;
      // Comparaison du niveau % vs moyenne — être plus maîtrisable est favorable (inverser=false)
      const cmpHtml = buildFonctComparison(
        pct,
        consoNat?.moy_pct_maitrisable || null,
        consoPer?.moy_pct_maitrisable || null,
        false
      );
      det.innerHTML = evolHtml + cmpHtml;
    }
  }

  // ── PILL 3 : Maîtrisable / agent 2025 + comparaison ──────────
  const pill3 = document.getElementById('fonct-pill-agent-2025');
  if (pill3) {
    const val = d.fonct_agent_2025;
    pill3.innerHTML = `<span style="font-size:22px;font-weight:700;color:var(--rep);">${formatCurrency(val)}</span>`;
    const det = document.getElementById('fonct-pill-agent-2025-detail');
    if (det) det.innerHTML = buildFonctComparison(
      val,
      consoNat?.moy_fonct_par_agent || null,
      consoPer?.moy_fonct_par_agent || null,
      true  // dépense : au-dessus = défavorable
    );
  }

  // ── PILL 4 : Maîtrisable / agent lissée 4 ans + comparaison ──
  const pill4 = document.getElementById('fonct-pill-agent-4ans');
  if (pill4) {
    const val = d.fonct_agent_4ans;
    pill4.innerHTML = `<span style="font-size:22px;font-weight:700;color:var(--rep);">${formatCurrency(val)}</span>`;
    const det = document.getElementById('fonct-pill-agent-4ans-detail');
    if (det) det.innerHTML = buildFonctComparison(
      val,
      consoNat?.moy_fonct_par_agent_4ans || null,
      consoPer?.moy_fonct_par_agent_4ans || null,
      true  // dépense : au-dessus = défavorable
    );
  }

  // ── Tableau multi-années ──────────────────────────────────────
  const tbody = document.getElementById('fonct-tbody');
  if (tbody) {
    const fmt    = formatFonctMontant;
    const fmtPct = (v) => v ? v.toFixed(1) + ' %' : '—';
    const fmtEur = (v) => v ? formatCurrency(v) : '—';

    tbody.innerHTML = `
      <tr>
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">CP total fonctionnement</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2022)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2023)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2024)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmt(d.cp_2025)}</td>
      </tr>
      <tr style="background:var(--gris4);">
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">dont maîtrisable</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2022_m)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2023_m)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmt(d.cp_2024_m)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmt(d.cp_2025_m)}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">% maîtrisable</td>
        <td style="padding:8px 12px;text-align:right;">${fmtPct(d.pct_m_2022)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmtPct(d.pct_m_2023)}</td>
        <td style="padding:8px 12px;text-align:right;">${fmtPct(d.pct_m_2024)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;">${fmtPct(d.pct_m_2025)}</td>
      </tr>
      <tr style="background:var(--gris4);">
        <td style="padding:8px 12px;font-weight:500;color:var(--gris2);">Maîtrisable / agent</td>
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

async function exportSingleStructurePDF(struct, annee) {
  const { jsPDF } = window.jspdf;
  const loadingDiv = showLoadingMessage(`Génération du PDF pour ${struct.sigle}...`);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    await addStructureToPDF(pdf, struct, annee, true);
    pdf.save(`fiche-identite-${struct.sigle}-${annee}.pdf`);
    hideLoadingMessage(loadingDiv);
  } catch (error) {
    hideLoadingMessage(loadingDiv);
    alert('Erreur lors de la génération du PDF.');
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
    
    pdf.save(`fiche-identite-toutes-structures-${annee}.pdf`);
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
      zip.file(`fiche-identite-${struct.sigle}-${annee}.pdf`, pdfBlob);
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
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNum}`, margin, footerY + 5);
    
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
  
  if (isFirstPage) addHeaderFooter(1);
  
  const ficheBody = document.getElementById('fiche-body');
  
  // Convertir les éditeurs EasyMDE (Markdown) en rendu HTML pour la capture PDF
  const _mdeExportDivs = [];
  ficheBody.querySelectorAll('.EasyMDEContainer').forEach(container => {
    const ta = container.querySelector('textarea');
    const mdeId = ta ? ta.id : null;
    const mdValue = mdeId && _mdeInstances[mdeId] ? _mdeInstances[mdeId].value() : (ta ? ta.value : '');
    // Toujours masquer le container EasyMDE (toolbar incluse) — même si vide
    container.style.display = 'none';
    if (mdValue && mdValue.trim()) {
      const div = document.createElement('div');
      div.className = 'md-render';
      div.style.cssText = 'font-family:Marianne,sans-serif;font-size:13px;color:var(--gris1);padding:8px;border:1px solid var(--bord);border-radius:4px;background:#fff;';
      div.innerHTML = mdToHtml(mdValue);
      container.parentNode.insertBefore(div, container);
      _mdeExportDivs.push({ div, container });
    } else {
      _mdeExportDivs.push({ div: null, container });
    }
  });

  // Construire la liste des blocs à capturer : en-tête fiche, commentaire synthèse, puis chaque section
  const captureTargets = [];
  
  // 1. En-tête fiche identité
  const ficheHeader = ficheBody.querySelector('.fiche-header');
  if (ficheHeader) captureTargets.push(ficheHeader);
  
  // 2. Encadré commentaire principal (synthèse + pills) — masquer les boutons d'édition pour l'export
  const mainCommentBox = ficheBody.querySelector('#main-comment-box');
  if (mainCommentBox) {
    // Masquer temporairement les boutons d'édition
    const editBtns = mainCommentBox.querySelectorAll('.comment-edit-btn, .comment-save-btn, .comment-cancel-btn');
    editBtns.forEach(btn => { btn.dataset.exportHidden = btn.style.display; btn.style.display = 'none'; });
    
    // Masquer l'éditeur de pills s'il est ouvert
    const pillsEditor = mainCommentBox.querySelector('.pills-editor');
    if (pillsEditor) pillsEditor.style.display = 'none';
    
    // Masquer le textarea d'édition si présent
    const editTextarea = mainCommentBox.querySelector('textarea');
    if (editTextarea) { editTextarea.dataset.exportHidden = editTextarea.style.display; editTextarea.style.display = 'none'; }
    
    // S'assurer que la description texte et les pills sont visibles
    const descriptionEl = mainCommentBox.querySelector('#comment-description, .comment-description');
    if (descriptionEl) descriptionEl.style.display = '';
    const pillsWrapper = mainCommentBox.querySelector('.comment-pills-wrapper');
    if (pillsWrapper) pillsWrapper.style.display = '';
    
    captureTargets.push(mainCommentBox);
  }
  
  // 3. Toutes les sections indicateurs
  ficheBody.querySelectorAll('.section').forEach(s => captureTargets.push(s));
  
  for (let element of captureTargets) {
    if (element.style.display === 'none' || !element.offsetParent) continue;
    
    const elHeight = element.offsetHeight;
    const estimatedPdfHeight = (elHeight * 0.264583) / 2;
    if (estimatedPdfHeight > 60) checkPageBreak(estimatedPdfHeight);
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = pageWidth - (2 * margin);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Hauteur utile d'une page (hors en-tête/pied/marges)
    const usablePage = pageHeight - footerHeight - margin - (margin + headerHeight + 5);

    if (imgHeight <= usablePage) {
      // L'image tient sur une page : saut de page si besoin puis placement normal
      checkPageBreak(imgHeight + 5);
      pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 5;
    } else {
      // L'image est trop haute : on la découpe en tranches page par page
      const canvasWidthPx  = canvas.width;
      const canvasHeightPx = canvas.height;
      // Ratio px → mm : imgWidth mm correspond à canvasWidthPx px
      const pxToMm = imgWidth / canvasWidthPx;
      // Hauteur en px d'une tranche correspondant à usablePage mm
      const sliceHeightPx = Math.floor(usablePage / pxToMm);

      let srcY = 0;
      while (srcY < canvasHeightPx) {
        const remainPx   = canvasHeightPx - srcY;
        const thisPx     = Math.min(sliceHeightPx, remainPx);
        const thisMm     = thisPx * pxToMm;

        // Créer un canvas temporaire pour la tranche
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width  = canvasWidthPx;
        sliceCanvas.height = thisPx;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, srcY, canvasWidthPx, thisPx, 0, 0, canvasWidthPx, thisPx);

        checkPageBreak(thisMm + 5);
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, yPosition, imgWidth, thisMm);
        yPosition += thisMm + 2;

        srcY += thisPx;
        // Saut de page entre deux tranches (sauf la dernière)
        if (srcY < canvasHeightPx) {
          addHeaderFooter(currentPage);
          pdf.addPage();
          currentPage++;
          yPosition = margin + headerHeight + 5;
        }
      }
      yPosition += 3;
    }
  }
  
  // Restaurer les boutons d'édition et états masqués après capture
  if (mainCommentBox) {
    const editBtns = mainCommentBox.querySelectorAll('.comment-edit-btn, .comment-save-btn, .comment-cancel-btn');
    editBtns.forEach(btn => {
      if (btn.dataset.exportHidden !== undefined) { btn.style.display = btn.dataset.exportHidden; delete btn.dataset.exportHidden; }
    });
    const pillsEditor = mainCommentBox.querySelector('.pills-editor');
    if (pillsEditor) pillsEditor.style.display = '';
    const editTextarea = mainCommentBox.querySelector('textarea');
    if (editTextarea && editTextarea.dataset.exportHidden !== undefined) {
      editTextarea.style.display = editTextarea.dataset.exportHidden;
      delete editTextarea.dataset.exportHidden;
    }
  }
  
  // Restaurer les éditeurs EasyMDE après capture PDF
  _mdeExportDivs.forEach(({ div, container }) => {
    if (div) div.remove();
    container.style.display = '';
  });
  
  addHeaderFooter(currentPage);
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
    div.style.cssText = 'font-family:Marianne,sans-serif;font-size:13px;color:var(--gris1);padding:8px;border:1px solid var(--bord);border-radius:4px;background:#fff;min-height:40px;';
    div.innerHTML = mdValue && mdValue.trim() ? mdToHtml(mdValue) : '<em style="color:var(--gris3);">Aucun commentaire.</em>';
    container.parentNode.insertBefore(div, container);
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
    container.style.display = '';
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
      /* Masquer les boutons d'édition à l'impression */
      .comment-edit-btn, .comment-save-btn, .comment-cancel-btn,
      .pills-editor, #selbar, #quick-nav { display: none !important; }
      /* Les textareas commentaire : afficher comme du texte statique */
      textarea {
        border: none !important;
        resize: none !important;
        background: transparent !important;
        padding: 0 !important;
        pointer-events: none;
      }
    }
    @page { margin: 20mm; size: A4 portrait; }
    /* Dans l'export HTML statique : masquer les boutons interactifs */
    .comment-edit-btn, .comment-save-btn, .comment-cancel-btn,
    .pills-editor, #selbar, #quick-nav { display: none !important; }
  `;
  
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Identité ${struct.sigle} - ${FICHE_STATE.annee}</title>
  <style>${styleContent}${printStyles}</style>
</head>
<body>
  <div style="max-width:1200px;margin:0 auto;padding:24px;">
    ${ficheBodyHTML}
  </div>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fiche-identite-${struct.sigle}-${FICHE_STATE.annee}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
