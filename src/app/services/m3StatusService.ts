
export interface Istatus {
    value: string;
    text: string;
}

export class StatusService {

public deliveryStatus: Istatus[] = [
    { value: '00', text: '00-Non libérée'},
    { value: '01', text: '01-Vérifier Affectation'},
    { value: '02', text: '02-Vérifier echec Affectation'},
    { value: '03', text: '03-Pick list Blockée'},
    { value: '05', text: '05-Prête pour Lib. PL'},
    { value: '50', text: '50-PL crée. Livraison bloquée'},
    { value: '60', text: '60-Completement déclarée'},
    { value: '62', text: '62-Livraison partie'},
    { value: '65', text: '65-Reception partiellement'},
    { value: '66', text: '66-Reception complète'},
    { value: '90', text: '90-Clos. Complètement déclarée'},
    { value: '95', text: '95-Clos. Reception partielle'},
];

public orderCategory: Istatus[] = [
    { value: '0', text: '0-Utilisation diverse'},
    { value: '1', text: '1-Ordre FabricationF'},
    { value: '2', text: '2-Ordre Achat'},
    { value: '3', text: '3-Commande Client'},
    { value: '4', text: '4-Ordre Réquisition'},
    { value: '5', text: '5-Ordre Distribution'},
    { value: '6', text: '6-Ordre Travail'},
    { value: '7', text: '7-Ordre Service'},
    { value: '8', text: '8-Ordre Distribution'},
    { value: '9', text: '9-Ordre Repl.'},
];

public packingStatus: Istatus[] = [
    { value: '00', text: '00-Colisage non utilisé'},
    { value: '10', text: '10-Colisage non débuté'},
    { value: '20', text: '20-Colisage débuté'},
    { value: '30', text: '30-Colisage terminé'},
    { value: '40', text: '40-Action Colisage terminée'}
];

public shipmentStatus: Istatus[] = [
    { value: '00', text: '00-Vide'},
    { value: '10', text: '10-Livr. Connectée. No Pick list'},
    { value: '20', text: '20-Livr. Connectée. Colisage non démarré'},
    { value: '30', text: '30-Livr. Connectée. Colisage démarré'},
    { value: '40', text: '40-Livr. Connectée. Colisage terminé'},
    { value: '50', text: '50-Colisage Expedition terminé'},
    { value: '60', text: '60-Expédition validé'},
    { value: '90', text: '90-Expédition annulée'},
];


public documentStatus: Istatus[] = [
    { value: '00', text: '00-Sans Doc' },
    { value: '05', text: '05-Référence' },
    { value: '10', text: '10-Générée' },
    { value: '20', text: '20-Imprimée' },
];

public jourStatus: Istatus[] = [
    { value: '1', text : 'Lundi'},
    { value: '2', text : 'Mardi'},
    { value: '3', text : 'Mercredi'},
    { value: '4', text : 'Jeudi'},
    { value: '5', text : 'Vendredi'},
    { value: '6', text : 'Samedi'},
    { value: '7', text : 'Dimanche'}
];

public POFStatus: Istatus[] = [
    { value: '10', text : 'Préliminaire'},
    { value: '20', text : 'Définif'},
    { value: '90', text : 'Bloqué/expiré'}
];

public OFStatus: Istatus[] = [
    { value: '10', text : '10-Préliminaire'},
    { value: '20', text : '20-Définif'},
    { value: '40', text : '40-Disponibilité des composants contrôlée'},
    { value: '50', text : '50-Poste de charge planifié'},
    { value: '60', text : '60-Ordre lancé'},
    { value: '80', text : '80-Ordre achevé, mais pas complètement enregistré'},
    { value: '90', text : '90-Bloqué/expiré'}
];

public OAStatus: Istatus[] = [
    { value: '10', text : '10-OA préliminaire'},
    { value: '20', text : '20-OA définif'},
    { value: '40', text : '40-OA Avis d\'expédition'},
    { value: '50', text : '50-Marchandises recues'},
    { value: '65', text : '65-Contrôle qualité terminé'},
    { value: '75', text : '75-Rangement terminée'},
    { value: '85', text : '85-OA enregistrement facture terminée'},
    { value: '99', text : '99-OA supprimé'}
];

public CMDStatus: Istatus[] = [
    { value: '05', text : '05-Devis'},
    { value: '10', text : '10-Préliminaire'},
    { value: '20', text : '20-Enregistré'},
    { value: '22', text : '22-Réservé'},
    { value: '23', text : '23-Réservé/Affecté'},
    { value: '24', text : '24-Réservé/Liste prélèv'},
    { value: '26', text : '26-Réservé/Livré'},
    { value: '27', text : '27-Réservé/Facturé'},
    { value: '29', text : '29-Réservé/Terminé'},
    { value: '33', text : '33-Affecté'},
    { value: '44', text : '44-Liste prélèv'},
    { value: '66', text : '66-Livré'},
    { value: '77', text : '77-Facturé'},
    { value: '90', text : '90-Supprimé'}
];

}

