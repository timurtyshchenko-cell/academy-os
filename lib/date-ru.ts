export function langToLocale(lang: string): string {
  if (lang === "ru") return "ru-RU";
  if (lang === "es") return "es-ES";
  return "en-US";
}

/** "Четверг, 4 июня" / "Thursday, June 4" / "Jueves, 4 de junio" */
export function fmtDateFull(d: string, locale = "ru-RU") {
  const date = new Date(d + "T12:00:00");
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(date);
}

/** "4 июня 2024 г." / "June 4, 2024" / "4 de junio de 2024" */
export function fmtDate(d: string, locale = "ru-RU") {
  const date = new Date(d.includes("T") ? d : d + "T12:00:00");
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** "Чт" / "Thu" / "Jue" */
export function fmtDayShort(date: Date, locale = "ru-RU") {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

/** "27 мая – 2 июня 2024 г." / "May 27 – June 2, 2024" / "27 de mayo – 2 de junio de 2024" */
export function fmtWeekRange(start: Date, end: Date, locale = "ru-RU") {
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
  return fmt.formatRange(start, end);
}

/** "2 hrs" / "2 horas" / "2 часа" / "1 h 30 min" / "30 min" */
export function fmtHours(hours: number, lang = "ru"): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (lang === "ru") {
    if (h === 0) return `${m} мин`;
    const mod10 = h % 10, mod100 = h % 100;
    const word = mod10 === 1 && mod100 !== 11 ? "час"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? "часа"
      : "часов";
    return m === 0 ? `${h} ${word}` : `${h} ч ${m} мин`;
  }
  if (lang === "es") {
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} ${h === 1 ? "hora" : "horas"}` : `${h} h ${m} min`;
  }
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} ${h === 1 ? "hr" : "hrs"}` : `${h} h ${m} min`;
}
