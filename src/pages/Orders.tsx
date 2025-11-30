import { Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getCurrentUser, getOrders, getListings } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Orders = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const orders = getOrders().filter(o => o.buyerId === currentUser.id);
  const listings = getListings();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your purchases</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => {
                  const listing = listings.find(l => l.id === order.listingId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        {listing && (
                          <div className="flex items-center gap-3">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="font-medium">{listing.title}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{order.totalXmr} XMR</TableCell>
                      <TableCell>
                        <Badge>{order.status.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Link to={`/order/${order.id}`}>
                          <Button variant="outline" size="sm">Track</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Link to="/browse">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
