from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_cors import CORS

from config import Config

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    CORS(app)

    # Preserve key order in JSON responses (for ordered shelf groupings)
    app.json.sort_keys = False

    # Register blueprints
    from app.routes.routes import api_bp
    from app.routes.lookup_routes import lookup_bp
    from app.routes.ingredient_routes import ingredients_bp
    from app.routes.kitchen_routes import kitchen_bp

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(lookup_bp, url_prefix="/api")
    app.register_blueprint(ingredients_bp, url_prefix="/api")
    app.register_blueprint(kitchen_bp, url_prefix="/api")

    # Create tables and seed on first run
    with app.app_context():
        from app.models import IngredientLookup, InStock, Kitchen  # noqa: F401

        db.create_all()

        from app.seed_data import seed_ingredient_lookup
        seed_ingredient_lookup()

    return app
