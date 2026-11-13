import type { LoginData, RegisterData, ForgotData, ResetData, ChangePasswordData } from "./validators";

export type SessionRole = "admin" | "editor" | "support" | "client";

type AuthResponse = {
  success: boolean;
  message?: string;
  data?: { user?: { role?: SessionRole } };
};

async function requestAuth(path: "login" | "register" | "change-password", data: Record<string, string>) {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Le service de connexion est momentanément indisponible.");
  }

  let result: AuthResponse;
  try {
    result = await response.json();
  } catch {
    throw new Error("Réponse invalide du service de connexion.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "La demande n’a pas abouti. Veuillez vérifier les informations saisies et réessayer.");
  }
  return result.data;
}

export async function login(data: LoginData): Promise<SessionRole> {
  const result = await requestAuth("login", data);
  const user = result?.user;
  if (!user?.role) throw new Error("Le service de connexion n’a pas renvoyé le rôle du compte.");
  return user.role;
}

export async function changePassword(data: ChangePasswordData & { email: string; currentPassword: string }): Promise<SessionRole> {
  const result = await requestAuth("change-password", {
    email: data.email,
    currentPassword: data.currentPassword,
    newPassword: data.password,
  });
  if (!result?.user?.role) throw new Error("Le service n’a pas confirmé la nouvelle session.");
  return result.user.role;
}

export async function register(data: RegisterData): Promise<void> {
  await requestAuth("register", {
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
  });
}

export async function forgotPassword(_data: ForgotData): Promise<void> {
  void _data;
  throw new Error("La récupération du mot de passe n’est pas disponible pour le moment. Veuillez réessayer ultérieurement ou contacter notre équipe.");
}

export async function resetPassword(_data: ResetData): Promise<void> {
  void _data;
  throw new Error("La réinitialisation du mot de passe n’est pas disponible pour le moment. Veuillez contacter notre équipe pour obtenir de l’aide.");
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("La déconnexion n’a pas pu être terminée.");
}
