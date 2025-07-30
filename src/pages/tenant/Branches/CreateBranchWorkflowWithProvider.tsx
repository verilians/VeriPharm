import React from "react";
import { BranchProvider } from "./BranchContext";
import CreateBranchWorkflow from "./CreateBranchWorkflow";

const CreateBranchWorkflowWithProvider: React.FC = () => {
  return (
    <BranchProvider>
      <CreateBranchWorkflow />
    </BranchProvider>
  );
};

export default CreateBranchWorkflowWithProvider;
