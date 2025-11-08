import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date: string | Date, dateFormat = "dd 'de' MMMM") => {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, dateFormat, { locale: ptBR });
};

export const formatTime = (date: string | Date, timeFormat = "HH:mm") => {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, timeFormat, { locale: ptBR });
};

