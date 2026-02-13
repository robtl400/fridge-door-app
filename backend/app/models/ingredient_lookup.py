from app import db
from datetime import datetime, timezone


class IngredientLookup(db.Model):
    __tablename__ = "ingredient_lookup"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ingredient_name = db.Column(db.String(255), nullable=False, unique=True)
    category = db.Column(db.String(255))
    subcategory = db.Column(db.String(255))
    default_expiration_days = db.Column(db.Integer, nullable=False)
    default_temperature_category = db.Column(db.String(50), nullable=False)
    default_shelf_name = db.Column(db.String(100), nullable=False)

    # Storage method fields
    refrigerated_min_days = db.Column(db.Integer)
    refrigerated_max_days = db.Column(db.Integer)
    frozen_min_days = db.Column(db.Integer)
    frozen_max_days = db.Column(db.Integer)
    pantry_unopened_min_days = db.Column(db.Integer)
    pantry_unopened_max_days = db.Column(db.Integer)
    pantry_opened_min_days = db.Column(db.Integer)
    pantry_opened_max_days = db.Column(db.Integer)

    # Metadata
    keywords = db.Column(db.Text)
    is_seed_data = db.Column(db.Boolean, default=True)
    times_added_by_user = db.Column(db.Integer, default=0)
    average_user_expiration_days = db.Column(db.Integer)

    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ingredient_name": self.ingredient_name,
            "category": self.category,
            "subcategory": self.subcategory,
            "default_expiration_days": self.default_expiration_days,
            "default_temperature_category": self.default_temperature_category,
            "default_shelf_name": self.default_shelf_name,
            "storage_methods": {
                "refrigerated": {
                    "min_days": self.refrigerated_min_days,
                    "max_days": self.refrigerated_max_days,
                }
                if self.refrigerated_min_days is not None
                else None,
                "frozen": {
                    "min_days": self.frozen_min_days,
                    "max_days": self.frozen_max_days,
                }
                if self.frozen_min_days is not None
                else None,
                "pantry_unopened": {
                    "min_days": self.pantry_unopened_min_days,
                    "max_days": self.pantry_unopened_max_days,
                }
                if self.pantry_unopened_min_days is not None
                else None,
                "pantry_opened": {
                    "min_days": self.pantry_opened_min_days,
                    "max_days": self.pantry_opened_max_days,
                }
                if self.pantry_opened_min_days is not None
                else None,
            },
            "keywords": self.keywords,
            "is_seed_data": self.is_seed_data,
            "times_added_by_user": self.times_added_by_user,
            "average_user_expiration_days": self.average_user_expiration_days,
        }

    def to_search_result(self):
        return {
            "ingredient_name": self.ingredient_name,
            "default_expiration_days": self.default_expiration_days,
            "default_temperature_category": self.default_temperature_category,
            "default_shelf_name": self.default_shelf_name,
        }
