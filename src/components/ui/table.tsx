import React from "react";
import cc from "classcat";

export interface TableProps {
    children?: React.ReactNode;
    className?: string;
}

export default function TableComponent({children, className}: TableProps): React.ReactNode {
    return (
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className={cc(["table", className])}>
                {children}
            </table>
        </div>
    );
}