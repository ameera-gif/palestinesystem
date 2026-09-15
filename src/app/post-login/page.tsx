import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homeForRole } from "@/lib/rbac";

// Login always redirects here first so we can route each role to its own
// portal home without the login form needing to know the role in advance.
export default async function PostLoginPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(homeForRole(session.user.role));
}
