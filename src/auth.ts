import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const auth = () => getServerSession(authOptions); 