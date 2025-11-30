import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ListingCard } from '@/components/ListingCard';
import { getListings } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const Browse = () => {
  const listings = getListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['All', 'Physical', 'Digital', 'Service'];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory && listing.status === 'active';
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Marketplace</h1>
          <p className="text-muted-foreground">
            Discover products and services from privacy-focused sellers
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category || (!selectedCategory && category === 'All') ? 'default' : 'outline'}
                      className="cursor-pointer w-full justify-start px-4 py-2"
                      onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {filteredListings.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No listings found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
