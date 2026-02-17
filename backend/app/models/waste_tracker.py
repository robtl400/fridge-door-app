from app import db


class WasteTracker(db.Model):
    __tablename__ = "waste_tracker"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kitchen_key = db.Column(
        db.String(20),
        db.ForeignKey("kitchens.kitchen_key"),
        nullable=False,
        unique=True,
    )
    eaten = db.Column(db.Integer, default=0, nullable=False)
    tossed = db.Column(db.Integer, default=0, nullable=False)

    kitchen = db.relationship("Kitchen", backref=db.backref("waste_tracker", uselist=False))

    def to_dict(self):
        return {
            "kitchen_key": self.kitchen_key,
            "eaten": self.eaten,
            "tossed": self.tossed,
        }
