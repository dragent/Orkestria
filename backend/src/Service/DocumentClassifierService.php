<?php

declare(strict_types=1);

namespace App\Service;

/**
 * Keyword-based document classifier.
 *
 * Returns a [scope, label] pair based on filename and mime-type analysis.
 * The scope must be one of the DocumentScope enum values.
 */
class DocumentClassifierService
{
    /** @var array<string, array{scope: string, label: string}> */
    private const RULES = [
        // RH keywords
        'contrat' => ['scope' => 'rh', 'label' => 'Contrat de travail'],
        'contract' => ['scope' => 'rh', 'label' => 'Work contract'],
        'bulletin' => ['scope' => 'rh', 'label' => 'Bulletin de salaire'],
        'salaire' => ['scope' => 'rh', 'label' => 'Document RH'],
        'paie' => ['scope' => 'rh', 'label' => 'Fiche de paie'],
        'payslip' => ['scope' => 'rh', 'label' => 'Payslip'],
        'cv' => ['scope' => 'rh', 'label' => 'Curriculum Vitae'],
        'resume' => ['scope' => 'rh', 'label' => 'Resume'],
        'conge' => ['scope' => 'rh', 'label' => 'Congés'],
        'leave' => ['scope' => 'rh', 'label' => 'Leave request'],

        // Finance keywords
        'facture' => ['scope' => 'finance', 'label' => 'Facture'],
        'invoice' => ['scope' => 'finance', 'label' => 'Invoice'],
        'devis' => ['scope' => 'finance', 'label' => 'Devis'],
        'quote' => ['scope' => 'finance', 'label' => 'Quote'],
        'budget' => ['scope' => 'finance', 'label' => 'Budget'],
        'comptabilite' => ['scope' => 'finance', 'label' => 'Comptabilité'],
        'accounting' => ['scope' => 'finance', 'label' => 'Accounting'],
        'bon-de-commande' => ['scope' => 'finance', 'label' => 'Bon de commande'],
        'purchase' => ['scope' => 'finance', 'label' => 'Purchase order'],
        'bdc' => ['scope' => 'finance', 'label' => 'Bon de commande'],

        // Legal keywords
        'accord' => ['scope' => 'legal', 'label' => 'Accord'],
        'avenant' => ['scope' => 'legal', 'label' => 'Avenant'],
        'nda' => ['scope' => 'legal', 'label' => 'NDA'],
        'confidentialite' => ['scope' => 'legal', 'label' => 'Confidentialité'],
        'confidentiality' => ['scope' => 'legal', 'label' => 'Confidentiality'],
        'legal' => ['scope' => 'legal', 'label' => 'Document juridique'],
        'juridique' => ['scope' => 'legal', 'label' => 'Document juridique'],
        'assurance' => ['scope' => 'legal', 'label' => 'Assurance'],
        'insurance' => ['scope' => 'legal', 'label' => 'Insurance'],
        'attestation' => ['scope' => 'legal', 'label' => 'Attestation'],

        // Tech keywords
        'spec' => ['scope' => 'tech', 'label' => 'Spécification'],
        'specification' => ['scope' => 'tech', 'label' => 'Spécification technique'],
        'technique' => ['scope' => 'tech', 'label' => 'Document technique'],
        'technical' => ['scope' => 'tech', 'label' => 'Technical document'],
        'architecture' => ['scope' => 'tech', 'label' => 'Architecture'],
        'cahier-des-charges' => ['scope' => 'tech', 'label' => 'Cahier des charges'],
        'cdc' => ['scope' => 'tech', 'label' => 'Cahier des charges'],
        'api' => ['scope' => 'tech', 'label' => 'Documentation API'],
        'readme' => ['scope' => 'tech', 'label' => 'Documentation'],
        'livrable' => ['scope' => 'tech', 'label' => 'Livrable technique'],
        'deliverable' => ['scope' => 'tech', 'label' => 'Deliverable'],

        // Design keywords
        'maquette' => ['scope' => 'design', 'label' => 'Maquette'],
        'mockup' => ['scope' => 'design', 'label' => 'Mockup'],
        'wireframe' => ['scope' => 'design', 'label' => 'Wireframe'],
        'design' => ['scope' => 'design', 'label' => 'Design'],
        'logo' => ['scope' => 'design', 'label' => 'Logo'],
        'charte' => ['scope' => 'design', 'label' => 'Charte graphique'],
        'brandbook' => ['scope' => 'design', 'label' => 'Brand book'],
        'prototype' => ['scope' => 'design', 'label' => 'Prototype'],
        'figma' => ['scope' => 'design', 'label' => 'Fichier Figma'],
        'sketch' => ['scope' => 'design', 'label' => 'Fichier Sketch'],
    ];

    /**
     * @return array{scope: string, label: string}
     */
    public function classify(string $filename, string $mimeType): array
    {
        $normalized = mb_strtolower($filename);
        $normalized = preg_replace('/[_\s]+/', '-', $normalized) ?? $normalized;
        $normalized = preg_replace('/\.[^.]+$/', '', $normalized) ?? $normalized;

        foreach (self::RULES as $keyword => $result) {
            if (str_contains($normalized, $keyword)) {
                return $result;
            }
        }

        return match (true) {
            str_starts_with($mimeType, 'image/') => ['scope' => 'design', 'label' => 'Image / Visuel'],
            default => ['scope' => 'tech', 'label' => 'Document non classifié'],
        };
    }
}
