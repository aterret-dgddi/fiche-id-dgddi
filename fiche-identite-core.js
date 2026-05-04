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
  
  grist.ready({ requiredAccess: 'read' });
  
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
    const [structures, rh, vehicules, frais_mission, informatique, notif_bop, consolidation] = await Promise.all([
      grist.docApi.fetchTable('Structures'),
      grist.docApi.fetchTable('RH'),
      grist.docApi.fetchTable('Vehicules'),
      grist.docApi.fetchTable('Frais_Mission'),
      grist.docApi.fetchTable('Informatique'),
      grist.docApi.fetchTable('Notif_BOP'),
      grist.docApi.fetchTable('Consolidation')
    ]);
    
    FICHE_STATE.data.structures = structures;
    FICHE_STATE.data.rh = rh;
    FICHE_STATE.data.vehicules = vehicules;
    FICHE_STATE.data.frais_mission = frais_mission;
    FICHE_STATE.data.informatique = informatique;
    FICHE_STATE.data.notif_bop = notif_bop;
    FICHE_STATE.data.consolidation = consolidation;
    
    console.log('✓ Données chargées:', {
      structures: structures.id.length,
      rh: rh.id.length,
      vehicules: vehicules.id.length,
      frais_mission: frais_mission.id.length,
      informatique: informatique.id.length,
      notif_bop: notif_bop.id.length,
      consolidation: consolidation.id.length
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
    region: structures.Region[idx]
  };
  
  refreshFiche();
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION DES DONNÉES PAR STRUCTURE
// ═══════════════════════════════════════════════════════════════

function getRHData(structureId, annee) {
  const rh = FICHE_STATE.data.rh;
  const idx = rh.id.findIndex((id, i) => 
    rh.Structure[i] === structureId && 
    rh.Annee[i] === annee &&
    (rh.Mois[i] === 0 || rh.Mois[i] === null)
  );
  
  if (idx === -1) return null;
  
  return {
    effectif_agco: rh.Effectif_AGCO[idx] || 0,
    effectif_su: rh.Effectif_SU[idx] || 0,
    effectif_autres: rh.Effectif_Autres[idx] || 0,
    effectif_total: rh.Effectif_Remuner[idx] || 0,
    masse_salariale: rh.Masse_Salariale[idx] || 0,
    age_moyen_agco: rh.Age_Moyen_AGCO[idx] || 0,
    age_moyen_su: rh.Age_Moyen_SU[idx] || 0,
    age_moyen_autres: rh.Age_Moyen_Autres[idx] || 0,
    pct_agco: rh.Pct_AGCO[idx] || 0,
    pct_su: rh.Pct_SU[idx] || 0,
    pct_autres: rh.Pct_Autres[idx] || 0
  };
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
  const idx = it.id.findIndex((id, i) => 
    it.Structure[i] === structureId && 
    it.Annee[i] === annee
  );
  
  if (idx === -1) return null;
  
  return {
    nb_portables: it.Nb_Portables[idx] || 0,
    nb_fixes: it.Nb_Fixes[idx] || 0,
    nb_postes_travail: it.Nb_Postes_Travail[idx] || 0,
    budget_it: it.Budget_IT_CP[idx] || 0,
    budget_it_par_agent: it.Budget_IT_Par_Agent[idx] || 0,
    budget_it_par_poste: it.Budget_IT_Par_Poste[idx] || 0,
    ratio_poste_agent: it.Ratio_Poste_Agent[idx] || 0,
    pct_portables: it.Pct_Portables[idx] || 0
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
