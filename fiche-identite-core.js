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
  annee: 2024,
  data: {
    structures: null,
    rh: null,
    vehicules: null,
    frais_mission: null,
    informatique: null,
    notif_bop: null,
    consolidation: null
  }
};

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
    const [structures, rh, vehicules, frais_mission, informatique, notif_bop, consolidation, commentaires] = await Promise.all([
      grist.docApi.fetchTable('Structures'),
      grist.docApi.fetchTable('RH'),
      grist.docApi.fetchTable('Vehicules'),
      grist.docApi.fetchTable('Frais_Mission'),
      grist.docApi.fetchTable('Informatique'),
      grist.docApi.fetchTable('Notif_BOP'),
      grist.docApi.fetchTable('Consolidation'),
      grist.docApi.fetchTable('Commentaires')
    ]);
    
    FICHE_STATE.data.structures = structures;
    FICHE_STATE.data.rh = rh;
    FICHE_STATE.data.vehicules = vehicules;
    FICHE_STATE.data.frais_mission = frais_mission;
    FICHE_STATE.data.informatique = informatique;
    FICHE_STATE.data.notif_bop = notif_bop;
    FICHE_STATE.data.consolidation = consolidation;
    FICHE_STATE.data.commentaires = commentaires;
    
    console.log('✓ Données chargées:', {
      structures: structures.id.length,
      rh: rh.id.length,
      vehicules: vehicules.id.length,
      frais_mission: frais_mission.id.length,
      informatique: informatique.id.length,
      notif_bop: notif_bop.id.length,
      consolidation: consolidation.id.length,
      commentaires: commentaires.id.length
    });
    
    hideLoader();
    onDataLoaded();
    
  } catch (err) {
    console.error('Erreur chargement:', err);
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

// ═══════════════════════════════════════════════════════════════
// EXTRACTION DES DONNÉES PAR STRUCTURE
// ═══════════════════════════════════════════════════════════════

function getRHData(structureId, annee) {
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
        sigle: structures.Sigle[structIdx] || structures.Nom[structIdx], // Utiliser Nom si pas de Sigle
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
  const idx = veh.id.findIndex((id, i) => 
    veh.Structure[i] === structureId && 
    veh.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    nombre_total: veh.Nombre_Total[idx] || 0,
    nombre_vetuste: veh.Nombre_Vetuste[idx] || 0,
    taux_vetuste: veh.Taux_Vetuste[idx] || 0,
    budget_fonctionnement: veh.Budget_Fonctionnement_CP[idx] || 0,
    budget_investissement: veh.Budget_Investissement_CP[idx] || 0,
    budget_total: veh.Budget_Total_CP[idx] || 0,
    ratio_vehicule_agent: veh.Ratio_Vehicule_Agent_Total[idx] || 0,
    ratio_vehicule_su: veh.Ratio_Vehicule_Agent_SU[idx] || 0
  };
}

function getFraisMissionData(structureId, annee) {
  const fm = FICHE_STATE.data.frais_mission;
  const idx = fm.id.findIndex((id, i) => 
    fm.Structure[i] === structureId && 
    fm.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    formation_transport: fm.Formation_Transport[idx] || 0,
    formation_repas: fm.Formation_Repas[idx] || 0,
    formation_hebergement: fm.Formation_Hebergement[idx] || 0,
    autres_transport: fm.Autres_Transport[idx] || 0,
    autres_repas: fm.Autres_Repas[idx] || 0,
    autres_hebergement: fm.Autres_Hebergement[idx] || 0,
    total_formation: fm.Total_Formation[idx] || 0,
    total_autres: fm.Total_Autres[idx] || 0,
    montant_total: fm.Montant_Total[idx] || 0,
    frais_par_agent: fm.Frais_Par_Agent[idx] || 0,
    pct_formation: fm.Pct_Formation[idx] || 0
  };
}

function getInformatiqueData(structureId, annee) {
  const it = FICHE_STATE.data.informatique;
  if (!it || !it.id) return null;
  
  const idx = it.id.findIndex((id, i) => 
    it.Structure && it.Structure[i] === structureId && 
    it.Annee && it.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    nb_portables: (it.Nb_Portables && it.Nb_Portables[idx]) || 0,
    nb_fixes: (it.Nb_Fixes && it.Nb_Fixes[idx]) || 0,
    nb_postes_travail: (it.Nb_Postes_Travail && it.Nb_Postes_Travail[idx]) || 0,
    budget_it: (it.Budget_IT_CP && it.Budget_IT_CP[idx]) || 0,
    budget_it_par_agent: (it.Budget_IT_Par_Agent && it.Budget_IT_Par_Agent[idx]) || 0,
    budget_it_par_poste: (it.Budget_IT_Par_Poste && it.Budget_IT_Par_Poste[idx]) || 0,
    ratio_poste_agent: (it.Ratio_Poste_Agent && it.Ratio_Poste_Agent[idx]) || 0,
    pct_portables: (it.Pct_Portables && it.Pct_Portables[idx]) || 0
  };
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

function getConsolidationData(perimetre, annee) {
  const conso = FICHE_STATE.data.consolidation;
  const idx = conso.id.findIndex((id, i) => 
    conso.Perimetre[i] === perimetre && 
    conso.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    nb_structures: conso.Nb_Structures[idx] || 0,
    total_effectif: conso.Total_Effectif[idx] || 0,
    total_effectif_agco: conso.Total_Effectif_AGCO[idx] || 0,
    total_effectif_su: conso.Total_Effectif_SU[idx] || 0,
    total_masse_salariale: conso.Total_Masse_Salariale[idx] || 0,
    moyenne_ms_par_agent: conso.Moyenne_MS_Par_Agent[idx] || 0,
    pct_agco: conso.Pct_AGCO[idx] || 0,
    pct_su: conso.Pct_SU[idx] || 0,
    total_vehicules: conso.Total_Vehicules[idx] || 0,
    taux_vetuste_moyen: conso.Taux_Vetuste_Moyen[idx] || 0,
    total_budget_vehicules: conso.Total_Budget_Vehicules[idx] || 0,
    total_notif_ae: conso.Total_Notif_AE[idx] || 0,
    total_notif_cp: conso.Total_Notif_CP[idx] || 0,
    total_conso_ae: conso.Total_Conso_AE[idx] || 0,
    total_conso_cp: conso.Total_Conso_CP[idx] || 0,
    taux_conso_moyen_ae: conso.Taux_Conso_Moyen_AE[idx] || 0,
    taux_conso_moyen_cp: conso.Taux_Conso_Moyen_CP[idx] || 0,
    total_frais_mission: conso.Total_Frais_Mission[idx] || 0,
    moyenne_frais_par_agent: conso.Moyenne_Frais_Par_Agent[idx] || 0,
    total_budget_it: conso.Total_Budget_IT[idx] || 0,
    moyenne_budget_it_par_agent: conso.Moyenne_Budget_IT_Par_Agent[idx] || 0
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
      console.log(`✓ Commentaire ${section} mis à jour`);
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
      console.log(`✓ Commentaire ${section} créé`);
    }
    
    // Recharger les commentaires
    const newComments = await grist.docApi.fetchTable('Commentaires');
    FICHE_STATE.data.commentaires = newComments;
    
  } catch (err) {
    console.error('Erreur sauvegarde commentaire:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT PDF/HTML
// ═══════════════════════════════════════════════════════════════

function exportToPDF() {
  // Utiliser html2pdf.js
  const element = document.getElementById('fiche-content');
  const opt = {
    margin: 10,
    filename: `fiche-identite-${FICHE_STATE.structure.sigle}-${FICHE_STATE.annee}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save();
}

function exportToHTML() {
  const element = document.getElementById('fiche-content');
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fiche Identité ${FICHE_STATE.structure.sigle} - ${FICHE_STATE.annee}</title>
  <style>${document.querySelector('style').innerHTML}</style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fiche-identite-${FICHE_STATE.structure.sigle}-${FICHE_STATE.annee}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

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
