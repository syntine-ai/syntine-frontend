import { Outlet } from "react-router-dom";
import { OrgAppShell } from "@/components/layout/OrgAppShell";

/**
 * Layout wrapper for organization routes.
 * This component is mounted ONCE and persists across route changes.
 * Child routes render inside the Outlet.
 */
export function OrgLayout() {
    return (
        <OrgAppShell>
            <Outlet />
        </OrgAppShell>
    );
}
