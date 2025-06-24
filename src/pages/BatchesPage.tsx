
import { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';
import BatchCard from '@/components/BatchCard';
import Footer from '@/components/Footer';

const BatchesPage = () => {
  const { batches } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.subjects.some(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Batches</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore our comprehensive course offerings and find the perfect batch for your learning journey
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search batches, subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Found {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Batches Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBatches.map((batch) => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              {searchTerm ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-4">No batches found</h3>
                  <p className="text-gray-500 text-lg mb-6">
                    No batches match your search for "{searchTerm}"
                  </p>
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Batches Available</h3>
                  <p className="text-gray-500 text-lg">New batches will be added soon. Check back later!</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BatchesPage;
