import TableEmployeeData from "./tableEmployeData";

export default function EmployeeDataPage() {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <h3 className="text-xl font-semibold">All employee data</h3>
            <div className="flex justify-between flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                    {/* <Input
                        classNames={{
                            input: "w-full",
                            mainWrapper: "w-full",
                        }}
                        placeholder="Search product"
                    /> */}
                </div>
                <div className="flex flex-row flex-wrap">
                    {/* <AddEmployee /> */}
                </div>
            </div>
            <div className="max-w-[95rem] mx-auto w-full">
                <TableEmployeeData />
            </div>
        </div>
    );
}