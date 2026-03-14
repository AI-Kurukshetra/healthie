import type { Provider } from "@/types/domain";

export type AdminProviderRecord = Provider & {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
};
