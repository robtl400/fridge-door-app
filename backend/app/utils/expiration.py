import re
from datetime import date, datetime, timedelta


def parse_expiration(value):
    """Parse flexible expiration input into a date object.

    Supported formats:
        "5 days"  / "5 day"  / "5d"   -> today + 5 days
        "2 weeks" / "2 week" / "2w"   -> today + 14 days
        "2/20"                        -> Feb 20 of the current (or next) year
        "2/20/26" / "2/20/2026"       -> Feb 20 2026
        "2026-02-20"                  -> ISO date
    """
    if isinstance(value, date):
        return value
    if isinstance(value, int):
        return date.today() + timedelta(days=value)

    s = str(value).strip().lower()

    # Relative: "5 days", "5d", "2 weeks", "2w"
    m = re.match(r"^(\d+)\s*(d|days?|w|weeks?)$", s)
    if m:
        n = int(m.group(1))
        unit = m.group(2)
        if unit.startswith("w"):
            n *= 7
        return date.today() + timedelta(days=n)

    # ISO: "2026-02-20"
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        pass

    # US short: "2/20/26" or "2/20/2026"
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{2,4})$", s)
    if m:
        month, day, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if year < 100:
            year += 2000
        return date(year, month, day)

    # US no year: "2/20" -> assume current or next year
    m = re.match(r"^(\d{1,2})/(\d{1,2})$", s)
    if m:
        month, day = int(m.group(1)), int(m.group(2))
        target = date(date.today().year, month, day)
        if target < date.today():
            target = date(date.today().year + 1, month, day)
        return target

    raise ValueError(f"Cannot parse expiration: {value!r}")
