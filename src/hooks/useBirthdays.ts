import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BirthdayPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  birth_date: string;
  title: string | null;
  department: string | null;
}

export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const currentMonth = new Date().getMonth() + 1;

      const { data, error } = await supabase
        .from("employees")
        .select("id, name, avatar_url, birth_date, title, department")
        .eq("active", true)
        .not("birth_date", "is", null);

      if (!active) return;

      if (error) {
        console.error("Erro ao buscar aniversariantes:", error);
        setBirthdays([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as BirthdayPerson[];
      const monthBirthdays = rows
        .filter((p: BirthdayPerson) => {
          if (!p.birth_date) return false;
          const month = parseInt(p.birth_date.split("-")[1], 10);
          return month === currentMonth;
        })
        .sort((a: BirthdayPerson, b: BirthdayPerson) => {
          const dayA = parseInt(a.birth_date.split("-")[2], 10);
          const dayB = parseInt(b.birth_date.split("-")[2], 10);
          return dayA - dayB;
        });

      setBirthdays(monthBirthdays);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return { birthdays, loading };
}
