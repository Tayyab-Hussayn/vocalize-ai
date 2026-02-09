import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Zap,
  Volume2,
  Download,
  Globe,
  Shield,
  Cpu,
  Sparkles,
  Clock,
  Headphones,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Free Forever',
    description: 'No subscriptions, no hidden fees. Generate unlimited high-quality voiceovers completely free using edge-tts technology.',
  },
  {
    icon: Volume2,
    title: 'Natural Voices',
    description: 'Access 50+ AI-powered voices with natural intonation, multiple accents, and support for various languages.',
  },
  {
    icon: Download,
    title: 'Instant Download',
    description: 'Download your generated audio in MP3 format instantly. No waiting, no watermarks, full quality.',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Support for English (US, UK, AU, CA, IN), Spanish, French, German, and many more languages.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your text is processed securely and never stored. All generations are ephemeral and private.',
  },
  {
    icon: Cpu,
    title: 'Edge Technology',
    description: "Powered by Microsoft's Edge-TTS engine for state-of-the-art speech synthesis quality.",
  },
];

const stats = [
  { icon: Clock, value: '< 2 seconds', label: 'Average generation time' },
  { icon: Headphones, value: '50+', label: 'Voice options' },
  { icon: Sparkles, value: '100%', label: 'Free to use' },
  { icon: Globe, value: '10+', label: 'Languages supported' },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id="features"
      className="relative py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE9F5] text-[#453478] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Why Choose VoiceAI
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features,{' '}
            <span className="text-[#453478]">Zero Cost</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience professional-grade text-to-speech conversion with features 
            that rival paid services, completely free.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="h-full bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-purple-100/60 hover:border-purple-200 transition-all duration-300">
                {/* Icon */}
                <div className="bg-[#EDE9F5] rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-5 group-hover:bg-[#453478] transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-[#453478] group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-50 rounded-3xl border border-gray-100 p-8 lg:p-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="bg-[#EDE9F5] rounded-2xl p-4 w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-[#453478]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#453478] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="bg-[#453478] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Transform Your Text?
              </h3>
              <p className="text-purple-100 max-w-xl mx-auto mb-8">
                Join thousands of content creators, educators, and developers 
                who trust VoiceAI for their text-to-speech needs.
              </p>
              <a
                href="#generator"
                className="inline-flex items-center gap-2 bg-white text-[#453478] font-semibold rounded-full px-8 py-4 hover:bg-purple-50 transition-colors shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Start Generating Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
