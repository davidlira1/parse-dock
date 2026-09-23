import type { PurchaseOrder } from "../types/purchase-order";
import { TextField } from "./TextField";

type ProjectSectionProps = {
  project: PurchaseOrder["project"];
  onChange: (project: PurchaseOrder["project"]) => void;
};

export function ProjectSection({ project, onChange }: ProjectSectionProps) {
  return (
    <section className="card">
      <h2>Project</h2>
      <div className="field-stack">
        <TextField
          id="project-name"
          label="Project Name"
          value={project.name}
          onChange={(name) => onChange({ ...project, name })}
        />
        <TextField
          id="project-job-number"
          label="Job Number"
          value={project.jobNumber}
          onChange={(jobNumber) => onChange({ ...project, jobNumber })}
        />
      </div>
    </section>
  );
}
