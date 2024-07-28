#!/bin/bash

EMAIL=""

# Generate ed25519 SSH key
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# Generate GPG key
gpg --batch --default-new-key-algo "ed25519/cert,sign+cv25519/encr" --quick-generate-key "my@email.com"