import React from "react";
import { BranchProvider } from "./BranchContext";
import Branches from "./index";

/**
 * Wrapper component that provides BranchProvider context for the Branches component.
 */
const BranchesWithProvider: React.FC = () => {
  return (
    <BranchProvider>
      <Branches />
    </BranchProvider>
  );
};

export default BranchesWithProvider;
