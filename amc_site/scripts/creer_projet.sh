#!/bin/bash
# file name: new_project.sh
PROJECT_DIR="$(pwd)/../uploads"

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <nom_du_projet>"
    exit 1
fi

mkdir "$PROJECT_DIR/$1"
mkdir "$PROJECT_DIR/$1/cr"
mkdir "$PROJECT_DIR/$1/cr/corrections"
mkdir "$PROJECT_DIR/$1/cr/corrections/jpg"
mkdir "$PROJECT_DIR/$1/cr/corrections/pdf"
mkdir "$PROJECT_DIR/$1/cr/diagnostic"
mkdir "$PROJECT_DIR/$1/cr/zooms"
mkdir "$PROJECT_DIR/$1/data"
mkdir "$PROJECT_DIR/$1/exports"
mkdir "$PROJECT_DIR/$1/scans"
mkdir "$PROJECT_DIR/$1/copies"