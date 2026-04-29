'use client';

import { motion } from 'framer-motion';

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none bg-slate-950">
      <motion.div
        animate={{
          x: ['-20%', '120%', '-20%'],
          y: ['-20%', '120%', '-20%'],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/30 blur-[120px]"
      />
      <motion.div
        animate={{
          x: ['120%', '-20%', '120%'],
          y: ['120%', '-20%', '120%'],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-[100px]"
      />
      <motion.div
        animate={{
          x: ['50%', '50%', '50%'],
          y: ['-50%', '150%', '-50%'],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[400px] h-[400px] rounded-full bg-blue-600/30 blur-[100px]"
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
}
