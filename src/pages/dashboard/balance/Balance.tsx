import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
function Expense() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary">Balance</h2>
             <p className="text-muted-foreground text-sm">Track who owes what and settle up</p>
        </div>
        
          <Button>Add Balance</Button>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">₹4543</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">6</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average per Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-purple-600">₹757.17</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Expense;
