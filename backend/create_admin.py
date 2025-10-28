import os
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import Admin

def create_admin(password, email, name="Administrator"):
    # Membuat aplikasi Flask
    app = create_app()

    # Push context aplikasi
    with app.app_context():
        # Cek apakah admin sudah ada dengan email
        if Admin.query.filter_by(email=email).first():
            print(f"Admin dengan email {email} sudah ada!")
            return

        # Buat admin baru
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        admin = Admin(
            name=name,
            email=email,
            password=hashed_password  # langsung isi ke kolom password
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"✅ Admin {name} berhasil dibuat!")
        print(f"Email: {email}")
        print(f"Password: {password}")

if __name__ == "__main__":
    # Ganti dengan credential yang diinginkan
    create_admin(
        password="admin123",
        email="admin@gmail.com",
        name="Admin Utama"
    )
