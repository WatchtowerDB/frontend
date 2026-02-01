import Card from "@/components/Card";
import React, { useEffect, useState } from "react";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import CheckIcon from "@mui/icons-material/Check";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import FlagCircleRoundedIcon from "@mui/icons-material/FlagCircleRounded";
import { DialogAction } from "@/types/DialogAction";
import { useComplianceStore } from "../store/complianceStore";
import { useSchemaStore } from "../store/schemaStore";
import { toast } from "sonner";
import { request } from "@/hooks/request";

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
  const fetchAssertionsBySchema = useComplianceStore(
    (state) => state.fetchAssertionsBySchema,
  );
  const selectedSchema = useSchemaStore((state) => state.selectedSchema);
  const fetchAssertionsCount = useComplianceStore(
    (state) => state.fetchAssertionsCount,
  );
  const handleRunCheck = async () => {
    console.log("It starts...");
    runCheck(1);
  };
  const handleModelInit = async () => {
    try {
      const res = await request("/api/model/init");
      if (!res.ok) {
        toast.error("Failed to initialize model");
        return;
      }
      const data = await res.json();
      toast.success(
        "Successfully started initializing the model. Status:",
        data,
      );
    } catch (err: any) {
      toast.error("Failed to initialize model, check console");
      console.log(err);
      return;
    }
  };

  useEffect(() => {}, [fetchAssertionsBySchema]);

  const actions: CardAction[] = [
    {
      icon: <FlagCircleRoundedIcon />,
      onClick: handleModelInit,
      label: "Initialize Model"
    },
    {
      icon: <PlayCircleIcon />,
      onClick: handleRunCheck,
      label: "Run Compliance Check"
    },
    {
      icon: <ReplayCircleFilledIcon />,
      label: "Refresh Assertions",
      onClick: async () => {
        try {
          // We await this so we can react to success or failure
          console.log("violationscard say selectedschema", selectedSchema);
          if (!selectedSchema) {
            toast.error("Select a schema first!");
            return;
          }
          await fetchAssertionsBySchema(selectedSchema);
          toast.success("Assertions refreshed!");
        } catch (err) {
          // The error is already logged in the store,
          // but we notify the user here locally too.
          toast.error("Failed to refresh assertions.");
        }
      },
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
