// Small compatibility layer so the app's pages keep their navigation calls
// while running on TanStack Router.
import {
  Link as TLink,
  useLocation as useTLocation,
  useParams as useTParams,
  useRouter,
} from "@tanstack/react-router";
import { forwardRef, useCallback, useEffect, useMemo, type AnchorHTMLAttributes } from "react";

type To = string | { pathname?: string; search?: string; hash?: string };
type NavOpts = { replace?: boolean; state?: unknown };

const toHref = (to: To) =>
  typeof to === "string" ? to : `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: To | number, opts?: NavOpts) => {
      if (typeof to === "number") return router.history.go(to);
      const href = toHref(to);
      const state = opts?.state ? { usr: opts.state } : undefined;
      if (opts?.replace) router.history.replace(href, state as never);
      else router.history.push(href, state as never);
    },
    [router],
  );
}

export function useLocation() {
  const loc = useTLocation();
  return {
    pathname: loc.pathname,
    search: loc.searchStr ?? "",
    hash: loc.hash ? `#${loc.hash}` : "",
    state: ((loc.state as { usr?: unknown })?.usr ?? null) as any,
    key: (loc.state as { key?: string })?.key ?? "default",
  };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return (useTParams as any)({ strict: false }) as T;
}

export function useSearchParams() {
  const loc = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const set = useCallback(
    (next: URLSearchParams | Record<string, string> | ((p: URLSearchParams) => URLSearchParams), opts?: NavOpts) => {
      const value = typeof next === "function" ? next(new URLSearchParams(loc.search)) : new URLSearchParams(next as any);
      const s = value.toString();
      navigate(`${loc.pathname}${s ? `?${s}` : ""}`, opts);
    },
    [loc.pathname, loc.search, navigate],
  );
  return [params, set] as const;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: To; replace?: boolean; state?: unknown };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, replace, state, ...rest }, ref) => (
  <TLink ref={ref} {...(rest as any)} to={toHref(to) as any} replace={replace} />
));
Link.displayName = "Link";

export const NavLink = Link;

export function Navigate({ to, replace }: { to: To; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
