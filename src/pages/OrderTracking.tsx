import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getOrder, getListing, updateOrder, getCurrentUser } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Package, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_USERS } from '@/lib/data';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = getOrder(id!);
  const listing = order ? getListing(order.listingId) : null;
  const currentUser = getCurrentUser();

  if (!order || !listing) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link to="/orders">
            <Button>View Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const seller = DEMO_USERS.find(u => u.id === order.sellerId);
  const isSeller = currentUser?.id === order.sellerId;

  const statusSteps = [
    { key: 'pending_payment', label: 'Created', icon: Package },
    { key: 'paid', label: 'Paid', icon: Check },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  const handleMarkShipped = () => {
    updateOrder(order.id, { status: 'shipped' });
    toast.success('Order marked as shipped!');
    navigate(0);
  };

  const handleMarkCompleted = () => {
    updateOrder(order.id, { status: 'completed' });
    toast.success('Order marked as completed!');
    navigate(0);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>

        {/* Order Status */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isComplete = index < currentStepIndex;
                
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Badge variant="default" className="text-base px-4 py-2">
                {statusSteps[currentStepIndex].label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Product</h2>
              <div className="flex gap-4">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold mb-2">{listing.title}</h3>
                  <Badge variant="secondary">{listing.category}</Badge>
                  <div className="mt-2 text-lg font-bold text-primary">
                    {order.totalXmr} XMR
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Info</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-sm">Order ID</span>
                  <p className="font-mono text-sm">{order.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Created</span>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Seller</span>
                  <p>{seller?.displayName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Quantity</span>
                  <p>{order.quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller Actions */}
        {isSeller && order.status === 'paid' && (
          <Card className="mt-6 bg-primary/10 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Seller Actions</h3>
              <Button onClick={handleMarkShipped} className="w-full">
                Mark as Shipped
              </Button>
            </CardContent>
          </Card>
        )}

        {isSeller && order.status === 'shipped' && (
          <Card className="mt-6 bg-primary/10 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Seller Actions</h3>
              <Button onClick={handleMarkCompleted} className="w-full">
                Mark as Completed
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
