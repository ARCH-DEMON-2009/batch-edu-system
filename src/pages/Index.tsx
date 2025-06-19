
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, Play, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';

const Index = () => {
  const { batches } = useData();

  const features = [
    {
      icon: BookOpen,
      title: 'Structured Learning',
      description: 'Organized batches with subjects, chapters, and lectures for systematic learning'
    },
    {
      icon: Play,
      title: 'Video Lectures',
      description: 'High-quality video content from YouTube and direct streaming sources'
    },
    {
      icon: FileText,
      title: 'Study Materials',
      description: 'Comprehensive notes and DPPs (Daily Practice Problems) for each lecture'
    },
    {
      icon: Calendar,
      title: 'Live Classes',
      description: 'Interactive live sessions with expert instructors'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master Your Studies with
              <span className="block text-blue-200">EduPortal</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Comprehensive online learning platform with structured courses, expert lectures, and live classes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/batches">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                  Explore Batches
                </Button>
              </Link>
              <Link to="/live-classes">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                  Join Live Classes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduPortal?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for effective online learning in one comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Available Batches Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Available Batches
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our comprehensive course offerings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {batches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-600">
                    {batch.name}
                  </CardTitle>
                  <CardDescription>{batch.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {batch.subjects.length} Subjects
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {batch.subjects.slice(0, 3).map((subject) => (
                        <span
                          key={subject.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${subject.color}`}
                        >
                          {subject.name}
                        </span>
                      ))}
                      {batch.subjects.length > 3 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                          +{batch.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                    <Link to={`/batch/${batch.id}`}>
                      <Button className="w-full mt-4">
                        View Batch Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {batches.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Batches Available</h3>
              <p className="text-gray-500">Check back later for new course offerings</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of students who are already mastering their subjects with our comprehensive courses
          </p>
          <Link to="/batches">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
