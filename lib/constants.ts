export const STATUS_OPTIONS = [
  "Lebendig",
  "Tot",
  "Vermisst",
  "Unbekannt",
] as const;

export const BEZIEHUNG_OPTIONS = [
  "Verbündet",
  "Freundlich",
  "Neutral",
  "Feindlich",
  "Unbekannt",
] as const;

export const GESCHLECHT_OPTIONS = [
  "Männlich",
  "Weiblich",
  "Divers",
] as const;

export const REGION_OPTIONS = [
  "Kaiserreich Asim",
  "Königreich Drakenfall",
  "Freie Inseln von Sangor",
  "Königreich der Nebelwölfe",
  "Wogenimperium",
  "Luxaria",
] as const;

export const ALIGNMENT_OPTIONS = [
  "Rechtschaffen Gut",
  "Neutral Gut",
  "Chaotisch Gut",
  "Rechtschaffen Neutral",
  "Wahrhaft Neutral",
  "Chaotisch Neutral",
  "Rechtschaffen Böse",
  "Neutral Böse",
  "Chaotisch Böse",
] as const;

export const ORGANISATION_TYP_OPTIONS = [
  "Gilde",
  "Fraktion",
  "Orden",
  "Regierung",
  "Kult",
  "Händlerverband",
  "Militär",
  "Kriminelle Organisation",
  "Sonstiges",
] as const;

export const QUEST_STATUS_OPTIONS = ["Aktiv","Abgeschlossen","Gescheitert","Pausiert","Unbekannt"] as const;
export const QUEST_TYP_OPTIONS = ["Hauptquest","Nebenquest","Gildenauftrag","Persönlich","Geheim"] as const;
export const QUEST_PRIORITAET_OPTIONS = ["Hoch","Mittel","Niedrig"] as const;
export const QUEST_NPC_ROLLEN = ["Auftraggeber","Ziel","Verbündeter","Antagonist","Belohnungsgeber","Sonstige"] as const;
export const QUEST_LOCATION_ROLLEN = ["Startpunkt","Zielort","Questort","Sonstige"] as const;
export const QUEST_ORG_ROLLEN = ["Auftraggeber","Betroffene Fraktion","Antagonist","Sonstige"] as const;
export const QUEST_CHAR_ROLLEN = ["Beteiligt","Hauptbeteiligter"] as const;
export const QUEST_JOURNAL_TYPEN = ["Entdeckung","Fortschritt","Abschluss"] as const;
