import Card from "@/components/Card";
import React, { useEffect, useState } from "react";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import CheckIcon from "@mui/icons-material/Check";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DialogAction } from "@/types/DialogAction";
import { useComplianceStore } from "../store/complianceStore";

type ViolationsCardProps = {
  count: number;
};
// const handleRunCheck = async () => {
//   // setLoading(true);
//   // setError(null);

//   try {
//     const res = await fetch("/api/compliance/run-check", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         framework: frameworkId,
//         schema: schemaId,
//       }),
//     });

//     if (!res.ok) throw new Error("Failed to start compliance check");

//     const data = await res.json();
//     console.log("Check started:", data);
//   } catch (err: any) {
//     console.error(err);
//   } finally {
//   }
// };

function ViolationsCard() {
  // const [violationsCount, setViolationsCount] = useState<number | undefined>(
  //   undefined,
  // );
  const assertions = useComplianceStore((state) => state.assertions);
  const loading = useComplianceStore((state) => state.loading);
  const error = useComplianceStore((state) => state.error);

  // Select actions
  const fetchAssertions = useComplianceStore((state) => state.fetchAssertions);
  const runCheck = useComplianceStore((state) => state.runCheck);
  const fetchAssertionsCount = useComplianceStore(
    (state) => state.fetchAssertionsCount,
  );
  const handleRunCheck = async () => {
    console.log("It starts...");
    runCheck(1);
  };

  useEffect(() => {
    fetchAssertions();
  }, [fetchAssertions]);

  const actions: CardAction[] = [
    {
      icon: <RefreshIcon />,
      onClick: handleRunCheck,
    },
  ];

  const violationsCount = assertions.length;
  return (
    <>
      {violationsCount === 0 ? (
        <Card
          bgColor="bg-gradient-to-b from-green-600 to-green-800"
          info={{ title: "No violations detected", value: 0 }}
          icon={() => <CheckIcon />}
          actions={actions}
        />
      ) : (
        <Card
          bgColor="bg-gradient-to-b from-red-700 to-red-900"
          info={{ title: "Violations detected", value: violationsCount }}
          icon={() => <GppMaybeIcon />}
          actions={actions}
        />
      )}
    </>
  );
}

export default ViolationsCard;
