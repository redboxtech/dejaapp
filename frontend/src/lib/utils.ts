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
