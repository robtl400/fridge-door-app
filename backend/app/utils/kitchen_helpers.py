from datetime import datetime, timezone
from app import db
from app.models.kitchen import Kitchen


def get_kitchen_or_404(kitchen_key):
    """Look up kitchen by key, update last_accessed, or return None."""
    kitchen = Kitchen.query.filter_by(kitchen_key=kitchen_key).first()
    if not kitchen:
        return None
    kitchen.last_accessed = datetime.now(timezone.utc)
    db.session.commit()
    return kitchen
