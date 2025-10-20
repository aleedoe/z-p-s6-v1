import os
from app import create_app
from flask_migrate import Migrate

app = create_app(os.getenv('FLASK_CONFIG') or 'development')
migrate = Migrate(app)

if __name__ == '__main__':
    app.run(debug=True)