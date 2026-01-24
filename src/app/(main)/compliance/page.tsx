"use client";

import { useEffect, useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import ViolationsList from "./components/AssertionsList";
import ViolationsCard from "./components/ViolationsCard";
import SchemaCard from "./components/SchemaCard";

export default function ComplianceDashboard() {
  // useEffect(() => {
  // }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
      </div> */}

      {/* Compliance Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <ViolationsCard />
        <SchemaCard />
      </div>

      {/* Table of Assertions/Violations*/}
      <ViolationsList />
    </div>
  );
}
