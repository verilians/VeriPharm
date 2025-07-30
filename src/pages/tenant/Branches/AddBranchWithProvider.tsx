import React from "react";
import { BranchProvider } from "./BranchContext";
import AddBranch from "./AddBranch";

/**
 * Wrapper component that provides BranchProvider context for the AddBranch component.
 */
const AddBranchWithProvider: React.FC = () => {
  return (
    <BranchProvider>
      <AddBranch />
    </BranchProvider>
  );
};

export default AddBranchWithProvider;
