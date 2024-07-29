use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};

use rand::Rng;

pub struct Auth {
    salt: String,
}


impl Auth {
    pub fn new() -> Self {
        let salt = generate_salt();
        // Argon2 with default params (Argon2id v19)
        Auth { salt }
    }

    pub fn hash_password(&self, password: &str) -> String {
        let salt = SaltString::generate(&mut OsRng);
        // Hash password to PHC string ($argon2id$v=19$...)
        let argon2 = Argon2::default();
    
        argon2.hash_password(password.as_bytes(), &salt).unwrap().to_string()
    }

    pub fn verify_password(&self, password: &str, hash: &str) -> bool {
        let argon2 = Argon2::default();
        let password_hash: &PasswordHash<'_> = &PasswordHash::new(hash).unwrap();
        match argon2.verify_password(password.as_bytes(), password_hash) {
            Ok(_) => true,
            Err(_) => false,
        }
    }
}

fn generate_salt() -> String {
    let mut rng = rand::thread_rng();
    let salt: [u8; 16] = rng.gen();
    hex::encode(salt)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password() {
        let auth = Auth::new();
        let password = "password";
        let hash = auth.hash_password(password);
        assert!(auth.verify_password(password, &hash));
    }
}