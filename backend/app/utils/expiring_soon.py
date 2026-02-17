MAX_THRESHOLD = 7
MIN_THRESHOLD = 1
MAX_ITEMS = 12


def compute_expiring_threshold(items):
    """Dynamically calculate the expiring-soon threshold for a list of InStock items.

    Starts at 7 days, reduces by 1 until <= 12 items qualify or threshold hits 1.
    Returns (threshold_days, expiring_items) where expiring_items is sorted soonest-first.
    """
    threshold = MAX_THRESHOLD

    while threshold > MIN_THRESHOLD:
        expiring = [i for i in items if i.days_until_expiration is not None
                     and i.days_until_expiration <= threshold]
        if len(expiring) <= MAX_ITEMS:
            break
        threshold -= 1
    else:
        # threshold hit MIN_THRESHOLD — collect one final time
        expiring = [i for i in items if i.days_until_expiration is not None
                     and i.days_until_expiration <= threshold]

    expiring.sort(key=lambda i: i.expiration_date)
    return threshold, expiring
