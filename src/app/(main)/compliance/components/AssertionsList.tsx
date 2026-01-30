import React from "react";
import { useEffect, useState } from "react";
import Assertion from "./Assertion";
import { useComplianceStore } from "../store/complianceStore";
import { useSchemaStore } from "../store/schemaStore";
type AssertionsListProps = {
  assertions: AssertionItem[];
};

const AssertionsList = () => {
  // const { violations, fetchViolations, loading, error } = useComplianceStore(
  //   (state) => ({
  //     violations: state.violations,
  //     fetchViolations: state.fetchViolations,
  //     loading: state.loading,
  //     error: state.error,
  //   }),
  // );
  const fetchAssertions = useComplianceStore((state) => state.fetchAssertions);
  const fetchAssertionsBySchema = useComplianceStore(
    (state) => state.fetchAssertionsBySchema,
  );
  const assertions = useComplianceStore((state) => state.assertions);
  const selectedSchema = useSchemaStore((state) => state.selectedSchema);
  const selectSchema = useSchemaStore((state) => state.selectSchema);

  useEffect(() => {
    if (selectedSchema) fetchAssertionsBySchema(selectedSchema);
  }, [fetchAssertions, selectSchema]); // Todo, worry about the conditions here.

  return (
    <div className="bg-table border-border h-full min-h-0 flex-1 rounded-md border shadow-xl">
      <h2 className="ms-4 mt-4 mb-6 text-4xl">Assertions</h2>
      {/* <div className="m-2 -mt-4 items-center max-h-full"></div> */}
      <div className="mx-auto h-[80%] w-[95%] rounded-xl p-2">
        {assertions.length > 0 ? (
          <div className="m-auto grid h-full flex-1 grid-cols-1 gap-2 overflow-y-auto px-4 py-4">
            {assertions.map((assertionData, index) => (
              <div
                className="items-center"
                key={index}
                //   style={{ backgroundColor: altBackgroundColor }}
              >
                <Assertion
                  assertionData={assertionData}
                  // dragDisabled={!!isDragDisabled}
                  // isDragging={isDragging}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-gray-200 p-10">
            <h2>No assertions/violations found.</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssertionsList;
