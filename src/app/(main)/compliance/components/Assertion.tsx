import { useState } from "react";
type AssertionProps = {
  assertionData: AssertionItem;
};

const Assertion: React.FC<AssertionProps> = ({ assertionData }) => {
  return (
    <div
      className="flex h-25 items-center justify-between space-y-2 bg-gray-100 p-4 shadow-md hover:bg-gray-200"
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
      <div>
        <div className="flex items-center space-x-2">
          {/* Name, Category and Description */}
          <div className="flex flex-col">
            <span className="text-text flex truncate font-semibold transition-colors duration-150">
              {assertionData.recommendation}
              {/* {taskData.name.length < 80 ? taskData.name : `${taskData.name.slice(0, 80)}...`} */}
            </span>

            <span
              className="text-text-subtle truncate"
              // style={{ color: altTextColor }}
            >
              {assertionData
                ? assertionData?.sql_query?.length < 100
                  ? assertionData.sql_query
                  : `${assertionData.sql_query?.slice(0, 100)}...`
                : ""}
            </span>
          </div>
        </div>
      </div>
      {/* Due Date and Actions */}
      {/* <div className="flex gap-12 me-6">
        <div>{(taskData.dueDate && !taskData.isDone && <DueDate dueDate={taskData.dueDate} />)} </div>
        <div>
          <DeleteTaskButton taskData={taskData} />
          <EditTaskButton id={taskData.id} previousData={taskData} />
          <ToTaskButton taskId={taskData.id} />
          {!dragDisabled ? <button className="ms-4"
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab' }}
          ><DragHandleIcon sx={{ color: buttonColor, transition: 'color 0.2s ease' }} /></button>
            :
            <DragHandleIcon className="ms-4" sx={{ opacity: "0" }} />
          }
        </div>
      </div> */}
    </div>
  );
};

export default Assertion;
