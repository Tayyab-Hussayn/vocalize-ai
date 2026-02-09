import { motion } from 'framer-motion';
import { Sparkles, Volume2, ArrowDown, Zap, Globe, Shield } from 'lucide-react';

interface HeroProps {
  onTryNowClick: () => void;
}

export function Hero({ onTryNowClick }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const features = [
    { icon: Zap, text: 'Instant Generation' },
    { icon: Globe, text: '50+ Voices' },
    { icon: Shield, text: '100% Free' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white pt-20 pb-16 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #453478 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-32 right-20 w-64 h-64 bg-[#EDE9F5] rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-32 left-20 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-40" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 mt-7 rounded-full bg-[#EDE9F5] text-[#453478] text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Free AI Text-to-Speech for Creators
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900"
        >
          Transform Text into
          <br />
          <span className="relative inline-block">
            <span className="text-[#453478]">Natural Speech</span>
            <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#EDE9F5] rounded-full" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Experience high-quality, AI-powered text-to-speech conversion completely free. 
          Generate natural-sounding voices with multiple accents and languages in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={onTryNowClick}
            className="btn-primary text-lg px-10 py-4"
          >
            <Volume2 className="w-5 h-5" />
            Try Now Free
          </button>
          <a
            href="#features"
            className="btn-secondary text-lg px-10 py-4"
          >
            Learn More
            <ArrowDown className="w-5 h-5" />
          </a>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-gray-600 text-sm font-medium"
            >
              <feature.icon className="w-4 h-4 text-[#453478]" />
              {feature.text}
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '100%', label: 'Free Forever' },
            { value: '50+', label: 'Voice Options' },
            { value: '<2s', label: 'Generation Time' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#453478]">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-[#453478]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
