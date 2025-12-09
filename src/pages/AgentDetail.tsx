import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { useParams } from "react-router-dom";

const AgentDetail = () => {
  const { id } = useParams();

  return (
    <OrgAppShell>
      <PageContainer
        title={`Agent #${id}`}
        subtitle="Agent configuration and performance"
      >
        <div className="bg-card rounded-lg shadow-card border border-border/50 p-8 text-center">
          <p className="text-muted-foreground">Agent detail page for ID: {id}</p>
          <p className="text-sm text-muted-foreground mt-2">Full implementation coming soon</p>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default AgentDetail;
