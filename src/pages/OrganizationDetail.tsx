import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { useParams } from "react-router-dom";

const OrganizationDetail = () => {
  const { id } = useParams();

  return (
    <AdminAppShell>
      <PageContainer
        title={`Organization #${id}`}
        subtitle="Organization details and management"
      >
        <div className="bg-card rounded-lg shadow-card border border-border/50 p-8 text-center">
          <p className="text-muted-foreground">Organization detail page for ID: {id}</p>
          <p className="text-sm text-muted-foreground mt-2">Full implementation coming soon</p>
        </div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default OrganizationDetail;
