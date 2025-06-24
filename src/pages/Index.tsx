
import { BookOpen, Play, FileText, Calendar, Users, Award, Target, Lightbulb } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import BatchCard from '@/components/BatchCard';
import Footer from '@/components/Footer';

const Index = () => {
  const { batches } = useData();

  const features = [
    {
      icon: BookOpen,
      title: 'Structured Learning',
      description: 'Organized batches with subjects, chapters, and lectures for systematic learning',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Play,
      title: 'Video Lectures',
      description: 'High-quality video content from YouTube and direct streaming sources',
      gradient: 'from-red-500 to-red-600'
    },
    {
      icon: FileText,
      title: 'Study Materials',
      description: 'Comprehensive notes and DPPs (Daily Practice Problems) for each lecture',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Calendar,
      title: 'Live Classes',
      description: 'Interactive live sessions with expert instructors',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Expert Faculty',
      description: 'Learn from experienced teachers and industry professionals',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Track record of successful students achieving their goals',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'Focused curriculum designed for competitive exam success',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      icon: Lightbulb,
      title: 'Interactive Learning',
      description: 'Engaging content with quizzes, assignments, and practice tests',
      gradient: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-white">
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
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Available Batches Section */}
      <section className="py-20 bg-gray-50">
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
            {batches.slice(0, 3).map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
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

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Success stories from our learning community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "JEE Aspirant",
                content: "The structured approach and quality content helped me achieve my dream score!",
                rating: 5
              },
              {
                name: "Rahul Kumar",
                role: "NEET Student",
                content: "Live classes and doubt clearing sessions made all the difference in my preparation.",
                rating: 5
              },
              {
                name: "Anita Patel",
                role: "CA Student",
                content: "Excellent faculty and comprehensive study materials. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-yellow-400 rounded-full mr-1"></div>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
