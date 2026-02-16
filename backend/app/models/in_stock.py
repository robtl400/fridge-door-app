from app import db
from datetime import datetime, timezone, date


class InStock(db.Model):
    __tablename__ = "in_stock"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ingredient_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    temperature_category = db.Column(db.String(50), nullable=False)
    shelf_name = db.Column(db.String(100), nullable=False)
    expiration_days = db.Column(db.Integer, nullable=False)
    date_added = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    expiration_date = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)

    # Link back to lookup table (optional — user may add custom items)
    lookup_id = db.Column(
        db.Integer, db.ForeignKey("ingredient_lookup.id"), nullable=True
    )
    lookup = db.relationship("IngredientLookup", backref="in_stock_items")

    @property
    def days_until_expiration(self):
        if self.expiration_date is None:
            return None
        exp = self.expiration_date
        if hasattr(exp, "date"):
            exp = exp.date()
        return (exp - date.today()).days

    def to_dict(self):
        return {
            "id": self.id,
            "ingredient_name": self.ingredient_name,
            "quantity": self.quantity,
            "temperature_category": self.temperature_category,
            "shelf_name": self.shelf_name,
            "expiration_days": self.expiration_days,
            "date_added": self.date_added.isoformat() if self.date_added else None,
            "expiration_date": self.expiration_date.isoformat()
            if self.expiration_date
            else None,
            "days_until_expiration": self.days_until_expiration,
            "notes": self.notes,
            "lookup_id": self.lookup_id,
        }
