#!/bin/bash

# Vérifie les arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <fichier_tex> <fichier_etudiants_csv>"
    exit 1
fi

TEX_FILE=$1
STUDENT_LIST=$2

echo ">>> Préparation du projet AMC"
auto-multiple-choice prepare --mode s --prefix ./ "./$TEX_FILE" \
    --out-sujet "DOC-subject.pdf" \
    --out-corrige "DOC-correction.pdf" \
    --data ./data \
    --out-calage "DOC-calage.xy"
  
echo ">>> Préparation de la bdd pour le barème"
auto-multiple-choice prepare --mode b --prefix ./ "$TEX_FILE" --data ./data/

echo ">>> Préparation du calage dans la bdd"
auto-multiple-choice meptex --src DOC-calage.xy --data ./data/

echo ">>> Génération des copies pour les étudiants"
auto-multiple-choice imprime -sujet "./DOC-subject.pdf" \
  --data "./data" \
  --methode file \
  --output "./copies/etudiant-%e.pdf"

echo ">>> Copies générées dans ./copies"
