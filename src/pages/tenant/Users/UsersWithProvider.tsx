import React from "react";
import { BranchProvider } from "../Branches/BranchContext";
import Users from "./index";

/**
 * Wrapper component that provides BranchProvider context for the Users component.
 */
const UsersWithProvider: React.FC = () => {
  return (
    <BranchProvider>
      <Users />
    </BranchProvider>
  );
};

export default UsersWithProvider;
