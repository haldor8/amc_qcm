#!/bin/bash

# Vérifie les arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <nom_projet> <fichier_etudiants_csv>"
    exit 1
fi

STUDENT_LIST=$1
BASEDIR="./"

echo ">>> Analyse des copies scannées"
auto-multiple-choice analyse --projet ./ ./scans/*

echo ">>> Association des copies aux étudiants"
auto-multiple-choice association-auto --data "./data" --notes-id id --liste "$STUDENT_LIST" --liste-key id

echo ">>> Calcul des notes"
auto-multiple-choice note --data "./data" --seuil 0.15 --notemin 0 --notemax 20

echo ">>> Export des résultats"
auto-multiple-choice export --data "./data" --module ods --fich-noms "$STUDENT_LIST" --o "$BASEDIR/exports/resultats.ods"

echo ">>> Correction terminée. Résultats dans : ./exports/resultats.odt"
