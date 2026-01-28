import { useState } from "react";
import ViewAssertionDialog from "./ViewAssertion";
type AssertionProps = {
  assertionData: AssertionItem;
};

const Assertion: React.FC<AssertionProps> = ({ assertionData }) => {
  const [isAssertionDialogOpen, setIsAssertionDialogOpen] =
    useState<boolean>(false);
  return (
    <>
      <button
        className="relative flex h-25 w-full items-center justify-between space-y-2 bg-gray-100 p-4 shadow-sm transition-transform duration-150 hover:z-10 hover:scale-[1.01] hover:cursor-pointer hover:bg-gray-200 hover:shadow-md"
        onClick={() => setIsAssertionDialogOpen(true)}
        title="View assertion"
        style={
          {
            // backgroundColor: hovered ? taskOnHoverColor : backgroundColor,
            // color: black
          }
        }
        //   onMouseEnter={() => {
        //     if (!isDragging) setHovered(true);
        //   }}
        //   onMouseLeave={() => {
        //     if (!isDragging) setHovered(false);
        //   }}
      >
        {/*Priority and isDone*/}
        <div className="flex items-center space-x-2">
          {/* Name, Category and Description */}
          <div className="flex flex-col">
            <span className="text-text flex truncate font-semibold transition-colors duration-150">
              {assertionData?.id}.{" "}
              {assertionData?.sql_query.length < 80
                ? assertionData?.sql_query
                : `${assertionData?.sql_query.slice(0, 80)}...}`}
              {/* {taskData.name.length < 80 ? taskData.name : `${taskData.name.slice(0, 80)}...`} */}
            </span>
            {/* <span
              className="text-text-subtle truncate"
              // style={{ color: altTextColor }}
            >
              {assertionData
                ? assertionData?.sql_query?.length < 100
                  ? assertionData.sql_query
                  : `${assertionData.sql_query?.slice(0, 100)}...`
                : ""}
            </span> */}
          </div>
          {/* <button onClick={() => setIsAssertionDialogOpen(true)}>
              Show Assertion
            </button> */}
        </div>
      </button>
      <ViewAssertionDialog
        open={isAssertionDialogOpen}
        onClose={() => setIsAssertionDialogOpen(false)}
        assertionData={assertionData.recommendation}
      />
    </>
  );
};

export default Assertion;
