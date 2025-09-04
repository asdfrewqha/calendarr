from datetime import datetime, timedelta


def find_next_weekday(available_weekdays):
    target_date = datetime.now().date()
    today_weekday = target_date.weekday()
    available_weekdays.sort()
    for day in available_weekdays:
        if day > today_weekday:
            days_ahead = day - today_weekday
            return target_date + timedelta(days=days_ahead)

    days_ahead = (7 - today_weekday) + available_weekdays[0]
    return target_date + timedelta(days=days_ahead)
