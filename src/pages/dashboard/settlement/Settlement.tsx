import { Button } from "@/components/ui/button";
function Expense() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary">Settlement</h2>
        </div>
          <Button>Add Settlement</Button>
      </div>
      <div></div>
    </div>
  );
}

export default Expense;
