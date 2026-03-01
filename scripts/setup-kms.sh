#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="firestore-myadmin-ea6fb"
LOCATION="europe-west1"
KEYRING="fma-keyring"
KEY="fma-credentials-key"

echo "=== Firestore MyAdmin - KMS Setup ==="
echo "Project: $PROJECT_ID"
echo "Location: $LOCATION"
echo ""

# 1. Set active project
echo "[1/5] Setting active project..."
gcloud config set project "$PROJECT_ID"

# 2. Enable KMS API
echo "[2/5] Enabling Cloud KMS API..."
gcloud services enable cloudkms.googleapis.com --project="$PROJECT_ID"

# 3. Create keyring (idempotent - ignores error if exists)
echo "[3/5] Creating keyring '$KEYRING'..."
gcloud kms keyrings create "$KEYRING" \
  --location="$LOCATION" \
  --project="$PROJECT_ID" 2>/dev/null || echo "  Keyring already exists, skipping."

# 4. Create key (idempotent)
echo "[4/5] Creating key '$KEY'..."
gcloud kms keys create "$KEY" \
  --location="$LOCATION" \
  --keyring="$KEYRING" \
  --purpose=encryption \
  --project="$PROJECT_ID" 2>/dev/null || echo "  Key already exists, skipping."

# 5. Grant Cloud Functions service account the encrypter/decrypter role
echo "[5/5] Granting IAM permissions to Cloud Functions service account..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CF_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud kms keys add-iam-policy-binding "$KEY" \
  --location="$LOCATION" \
  --keyring="$KEYRING" \
  --member="serviceAccount:${CF_SA}" \
  --role="roles/cloudkms.cryptoKeyEncrypterDecrypter" \
  --project="$PROJECT_ID" --quiet

echo ""
echo "=== KMS Setup Complete ==="
echo "Keyring: projects/$PROJECT_ID/locations/$LOCATION/keyRings/$KEYRING"
echo "Key:     projects/$PROJECT_ID/locations/$LOCATION/keyRings/$KEYRING/cryptoKeys/$KEY"
echo "SA:      $CF_SA (encrypter/decrypter)"
