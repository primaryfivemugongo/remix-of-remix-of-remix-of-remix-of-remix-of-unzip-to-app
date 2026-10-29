import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Plus, Filter } from "lucide-react";
import { useState } from "react";

export default function StockManagement() {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const handleLogout = () => {
    signOut();
  };

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'music', label: 'Music Department' },
    { value: 'ict', label: 'ICT Department' },
    { value: 'sports', label: 'Sports Department' },
    { value: 'transport', label: 'Transport Department' },
    { value: 'library', label: 'Library' },
    { value: 'academics', label: 'Academics' },
  ];

  // Sample data - this would come from a database in production
  const stockItems = [
    { id: 1, name: 'Guitars & Amplifiers', department: 'Music Department', quantity: 45, status: 'In Stock', minStock: 20 },
    { id: 2, name: 'Computer Keyboards', department: 'ICT Department', quantity: 35, status: 'In Stock', minStock: 30 },
    { id: 3, name: 'Football Balls', department: 'Sports Department', quantity: 12, status: 'Low Stock', minStock: 20 },
    { id: 4, name: 'School Buses - Fuel', department: 'Transport Department', quantity: 8, status: 'Low Stock', minStock: 15 },
    { id: 5, name: 'Textbooks - Mathematics', department: 'Library', quantity: 150, status: 'In Stock', minStock: 100 },
    { id: 6, name: 'Whiteboard Markers', department: 'Academics', quantity: 85, status: 'In Stock', minStock: 50 },
    { id: 7, name: 'Piano Keys Replacement', department: 'Music Department', quantity: 5, status: 'Low Stock', minStock: 10 },
    { id: 8, name: 'Laptop Chargers', department: 'ICT Department', quantity: 18, status: 'In Stock', minStock: 15 },
  ];

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || 
                             item.department.toLowerCase().includes(selectedDepartment);
    return matchesSearch && matchesDepartment;
  });

  return (
    <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="w-full min-w-0 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8 px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
              Stock Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Track and manage school materials</p>
          </div>
          <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto shrink-0">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add New Item</span>
            <span className="sm:hidden">Add Item</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stockItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stockItems.filter(i => i.status === 'In Stock').length}</div>
              <p className="text-xs text-muted-foreground mt-1">Items available</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stockItems.filter(i => i.status === 'Low Stock').length}</div>
              <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{departments.length - 1}</div>
              <p className="text-xs text-muted-foreground mt-1">Active departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search items or departments..." 
                  className="pl-10 h-11 text-base focus:ring-2 focus:ring-primary/20" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-72 h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stock Items - Desktop Table */}
        <Card className="shadow-md hidden lg:block">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Stock Inventory</CardTitle>
              <span className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {stockItems.length} items
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Item Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Department</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Quantity</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Min. Stock</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 font-semibold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No items found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/30 transition-all group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{item.department}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-lg">{item.quantity}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{item.minStock}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            item.status === 'In Stock' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              item.status === 'In Stock' ? 'bg-green-600' : 'bg-orange-600'
                            }`}></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Stock Items - Mobile Grid */}
        <div className="lg:hidden space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base sm:text-lg font-semibold">Stock Inventory ({filteredItems.length})</h3>
          </div>
          {filteredItems.length === 0 ? (
            <Card className="mx-1">
              <CardContent className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">No items found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
              {filteredItems.map((item) => (
                <Card key={item.id} className="w-full overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm leading-tight mb-1 break-words">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.department}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Quantity</span>
                          <p className="font-semibold text-base">{item.quantity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Min. Stock</span>
                          <p className="font-semibold text-base">{item.minStock}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'In Stock' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            item.status === 'In Stock' ? 'bg-green-600' : 'bg-orange-600'
                          }`}></span>
                          {item.status}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
