import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

/**
 * Sidebar state shared by the admin and staff layouts.
 * - desktop (md and up): the sidebar is always visible and can collapse to icons
 * - mobile: the sidebar is a slide-over drawer opened from the hamburger button
 */
export const useSidebar = () => {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock page scroll while the drawer is open and close it with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const toggle = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  };

  return { collapsed, mobileOpen, toggle, closeMobile: () => setMobileOpen(false) };
};
