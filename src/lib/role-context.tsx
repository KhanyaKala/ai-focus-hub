import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "professional";
const KEY = "phai:role";

type Ctx = {
  role: Role | null;
  setRole: (r: Role | null) => void;
  ready: boolean;
};

const RoleContext = createContext<Ctx>({ role: null, setRole: () => {}, ready: false });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "student" || v === "professional") setRoleState(v);
    } catch {}
    setReady(true);
  }, []);

  const setRole = (r: Role | null) => {
    setRoleState(r);
    try {
      if (r) localStorage.setItem(KEY, r);
      else localStorage.removeItem(KEY);
    } catch {}
  };

  return <RoleContext.Provider value={{ role, setRole, ready }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);

export function roleContextLine(role: Role | null) {
  if (role === "student")
    return "The user is a STUDENT. Tailor examples to studying, assignments, exams, lectures, research, and academic writing. Use a supportive, encouraging tone.";
  if (role === "professional")
    return "The user is a PROFESSIONAL. Tailor examples to meetings, projects, clients, workplace communication, and business writing. Use a polished, business-appropriate tone.";
  return "";
}
