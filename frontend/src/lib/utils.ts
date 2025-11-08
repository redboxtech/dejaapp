/**
 * Formata um nome completo para exibir apenas o primeiro e último nome
 * @param fullName - Nome completo do usuário
 * @returns Primeiro e último nome, ou nome completo se houver apenas um nome
 */
export function formatDisplayName(fullName: string): string {
  if (!fullName) return "";
  
  const names = fullName.trim().split(" ").filter(n => n.length > 0);
  
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  
  // Retorna primeiro e último nome
  return `${names[0]} ${names[names.length - 1]}`;
}

/**
 * Obtém as iniciais de um nome (máximo 2 letras)
 * @param name - Nome completo
 * @returns Iniciais em maiúsculas
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  const names = name.trim().split(" ").filter(n => n.length > 0);
  
  if (names.length === 0) return "";
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Remove todos os caracteres que não são dígitos e limita a 11 números.
 * @param value - texto contendo o telefone
 * @returns apenas os dígitos do telefone
 */
export function sanitizePhoneNumber(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 11);
}

/**
 * Formata telefone brasileiro no padrão (00) 90000-0000
 * @param value - Número de telefone com ou sem máscara
 * @returns Telefone formatado
 */
export function formatPhoneNumber(value?: string | null): string {
  const digits = sanitizePhoneNumber(value);
  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  const firstPart = digits.slice(2, 7);
  const secondPart = digits.slice(7, 11);

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${ddd}) ${digits.slice(2)}`;
  }

  return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ""}`;
}
