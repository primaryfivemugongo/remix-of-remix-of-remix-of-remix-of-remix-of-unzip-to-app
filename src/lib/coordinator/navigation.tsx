import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link as PortalLink, useNavigate as usePortalNavigate, useParams, useSearchParams, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
const paths: Record<string, string> = {
  "/": "/student/electoral/hub", "/vote": "/student/electoral/vote", "/results": "/student/electoral/results",
  "/apply": "/student/electoral/apply", "/status": "/student/electoral/status", "/admin": "/admin/electoral/", "/auth": "/login",
};
function href(to: string, params?: { id: string }, search?: { position?: string }) {
  const path = to === "/candidate/$id" ? `/student/electoral/candidate/${encodeURIComponent(params?.id ?? "")}` : paths[to] ?? to;
  return search?.position ? `${path}?position=${encodeURIComponent(search.position)}` : path;
}
export const Link = forwardRef<HTMLAnchorElement, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; params?: { id: string }; search?: { position?: string } }>(({ to, params, search, ...props }, ref) => {
  const { userRole } = useAuth();
  const { pathname } = useLocation();
  const destination = to === "/portal" ? `/${userRole ?? "student"}` : href(to, params, search);
  return <PortalLink ref={ref} to={destination} aria-current={pathname === destination ? "page" : undefined} {...props} />;
});
Link.displayName = "ElectionLink";
export function useNavigate() { const navigate = usePortalNavigate(); return ({ to }: { to: string }) => navigate(href(to)); }
export function useElectionSearch() { const [params] = useSearchParams(); return { position: params.get("position") ?? undefined }; }
export function useElectionParams() { return useParams<{ id: string }>(); }