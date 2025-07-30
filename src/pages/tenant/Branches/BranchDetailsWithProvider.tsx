import React from "react";
import { BranchProvider } from "./BranchContext";
import BranchDetails from "./BranchDetails";

/**
 * Wrapper component that provides BranchProvider context for the BranchDetails component.
 */
const BranchDetailsWithProvider: React.FC = () => {
  return (
    <BranchProvider>
      <BranchDetails />
    </BranchProvider>
  );
};

export default BranchDetailsWithProvider;
