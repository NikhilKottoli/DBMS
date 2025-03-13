import React from 'react';
import { motion } from 'framer-motion';
import { DatabaseIcon, Shield, Zap, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const teamMembers = [
    { name: 'Aditya Suresh', id: '231CS203' },
    { name: 'Mohnish Hemanth Kumar', id: '231CS235' },
    { name: 'Nikhil Kottoli', id: '231CS236' },
    { name: 'Vishal', id: '231CS263' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Dedicated secure server with monitoring for payment-related write requests'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Continuous streaming and classification of incoming banking requests'
    },
    {
      icon: Scale,
      title: 'Optimized Performance',
      description: 'Segregated read and write workloads for improved response times'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <DatabaseIcon className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">StreamQuery</span>
            </Link>
            <Link
              to="/signin"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-16"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real-Time SQL Stream Processing
              <br />
              for Banking Systems
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing banking operations with intelligent request routing and real-time processing
            </p>
          </motion.section>

          {/* Team Section */}
          <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-blue-50 rounded-xl hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                  <p className="text-blue-600">{member.id}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* Description Section */}
          <motion.section
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl p-8 prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold mb-6">About StreamQuery</h2>
            <p className="text-gray-600 mb-6">
              Modern banking systems handle a high volume of diverse requests, including payment
              transactions, balance inquiries, and account modifications. Efficiently processing these
              requests in real-time while ensuring security and performance is a critical challenge.
              StreamQuery is a stream processing tool designed to intelligently route and manage
              different types of banking requests using SQL-based processing.
            </p>
            <p className="text-gray-600 mb-6">
              StreamQuery continuously streams incoming requests, classifies them, and directs them
              based on their risk level. Payment-related write requests (such as fund transfers,
              deposits, and withdrawals) are redirected to a dedicated secure server with monitoring,
              ensuring enhanced security and compliance. Meanwhile, read requests (such as balance
              checks and transaction history lookups) are processed directly to improve response times
              and reduce system load.
            </p>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Real-time classification and routing of banking transactions</li>
                <li>Enhanced security for high-risk operations</li>
                <li>Optimized performance by segregating read and write workloads</li>
              </ul>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default AboutUs;