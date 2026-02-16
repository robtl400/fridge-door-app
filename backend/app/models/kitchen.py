from app import db
from datetime import datetime, timezone


class Kitchen(db.Model):
    __tablename__ = "kitchens"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kitchen_key = db.Column(
        db.String(20), unique=True, nullable=False, index=True
    )
    name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    last_accessed = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relationship to in_stock items
    items = db.relationship("InStock", backref="kitchen", lazy=True)

    def to_dict(self):
        return {
            "kitchen_key": self.kitchen_key,
            "name": self.name,
            "created_at": self.created_at.isoformat()
            if self.created_at
            else None,
            "last_accessed": self.last_accessed.isoformat()
            if self.last_accessed
            else None,
        }
